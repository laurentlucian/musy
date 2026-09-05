import { sql } from "drizzle-orm";
import { SQLiteSyncDialect } from "drizzle-orm/sqlite-core";
import {
  dashboardSnapshotState,
  dashboardSnapshotPublish,
} from "./dashboard-snapshot-query";
import {
  dashboardQueries,
  summarizeDashboard,
  type DashboardPeriod,
  type DashboardRank,
  type DashboardTotals,
} from "./dashboard-query";

async function calculateDashboard(
  d1: D1Database,
  userId: string,
  year: number,
) {
  const queries = dashboardQueries(userId, year);
  const dialect = new SQLiteSyncDialect();
  const statements = [
    ...Object.values(queries),
    sql`SELECT COUNT(*) AS pending FROM AnalyticsYear
    WHERE userId=${userId} AND revision<>publishedRevision ${year ? sql`AND year=${year}` : sql``}`,
  ];
  const result = await d1.batch([
    ...statements.map((statement) => {
      const query = dialect.sqlToQuery(statement);
      return d1.prepare(query.sql).bind(...query.params);
    }),
    d1.prepare(dashboardSnapshotState).bind(userId, year),
  ]);
  const totals = result[0].results as DashboardTotals[];
  const days = result[1].results as DashboardPeriod[];
  const hourly = result[2].results as { key: string; plays: number }[];
  const topTracks = result[3].results as DashboardRank[];
  const topArtists = result[4].results as DashboardRank[];
  const topAlbums = result[5].results as DashboardRank[];
  const years = result[6].results as { year: number | null }[];
  return {
    sourceRevision: (result[8].results[0] as SnapshotState).currentRevision,
    data: {
      ...summarizeDashboard(totals[0], days, hourly, year),
      pending:
        Number(
          (result[7].results[0] as { pending: number } | undefined)?.pending ??
            0,
        ) > 0,
      topTracks,
      topArtists,
      topAlbums,
      availableYears: years.flatMap((row) =>
        row.year === null ? [] : [row.year],
      ),
    },
  };
}

type Dashboard = Awaited<ReturnType<typeof calculateDashboard>>["data"];
type SnapshotState = {
  payload: string | null;
  sourceRevision: string | null;
  currentRevision: string;
  dirty: number;
  years: string;
};

export async function refreshDashboardStore(
  d1: D1Database,
  userId: string,
  year: number,
) {
  const state = await d1
    .prepare(dashboardSnapshotState)
    .bind(userId, year)
    .first<SnapshotState>();
  if (
    !state ||
    state.dirty ||
    (state.payload && state.sourceRevision === state.currentRevision)
  )
    return;
  const { sourceRevision, data } = await calculateDashboard(d1, userId, year);
  if (data.pending) return;
  await d1
    .prepare(dashboardSnapshotPublish)
    .bind(userId, year, sourceRevision, JSON.stringify(data), Date.now())
    .run();
}

export async function getDashboardStore(
  d1: D1Database,
  userId: string,
  year: number,
): Promise<Dashboard> {
  const state = await d1
    .prepare(dashboardSnapshotState)
    .bind(userId, year)
    .first<SnapshotState>();
  if (state?.payload)
    return {
      ...(JSON.parse(state.payload) as Dashboard),
      pending: !!state.dirty || state.sourceRevision !== state.currentRevision,
      availableYears: JSON.parse(state.years) as number[],
    };
  const empty: DashboardTotals = {
    played: 0,
    minutes: 0,
    uniqueTracks: 0,
    estimatedPlays: 0,
    unknownPlays: 0,
    uniqueArtists: 0,
    uniqueAlbums: 0,
    liked: 0,
  };
  return {
    ...summarizeDashboard(empty, [], [], year),
    pending: state
      ? (JSON.parse(state.years) as number[]).some(
          (value) => year === 0 || value === year,
        )
      : false,
    topTracks: [],
    topArtists: [],
    topAlbums: [],
    availableYears: state ? (JSON.parse(state.years) as number[]) : [],
  };
}
