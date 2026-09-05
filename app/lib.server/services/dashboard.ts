import { db } from "~/lib.server/services/db";
import {
  dashboardQueries,
  summarizeDashboard,
  type DashboardPeriod,
  type DashboardRank,
  type DashboardTotals,
} from "./dashboard-query";

export async function getDashboard(userId: string, year: number) {
  const queries = dashboardQueries(userId, year);
  const [totals, days, hourly, topTracks, topArtists, topAlbums, years] =
    await Promise.all([
      db.all<DashboardTotals>(queries.totals),
      db.all<DashboardPeriod>(queries.days),
      db.all<{ key: string; plays: number }>(queries.hourly),
      db.all<DashboardRank>(queries.topTracks),
      db.all<DashboardRank>(queries.topArtists),
      db.all<DashboardRank>(queries.topAlbums),
      db.all<{ year: number | null }>(queries.years),
    ]);
  return {
    ...summarizeDashboard(totals[0], days, hourly, year),
    topTracks,
    topArtists,
    topAlbums,
    availableYears: years.flatMap((row) =>
      row.year === null ? [] : [row.year],
    ),
  };
}
