import { sql } from "drizzle-orm";

export type DashboardRank = { id: string | null; name: string; plays: number };
export type DashboardPeriod = { key: string; plays: number; minutes: number };
export type DashboardTotals = {
  played: number;
  minutes: number;
  uniqueTracks: number;
  estimatedPlays: number;
  unknownPlays: number;
  uniqueArtists: number;
  uniqueAlbums: number;
  liked: number;
};

export function dashboardQueries(userId: string, year: number) {
  const range = (column: ReturnType<typeof sql>) =>
    year
      ? sql`AND datetime(${column}) >= ${`${year}-01-01 00:00:00`} AND datetime(${column}) < ${`${year + 1}-01-01 00:00:00`}`
      : sql``;
  const base = sql`WITH events AS (
    SELECT r.trackId, r.plays, r.milliseconds, r.estimatedPlays, r.unknownPlays, t.name, t.albumId,
      a.name AS albumName, r.archiveAlbum, r.archiveArtist
    FROM ListeningTrackSummary r JOIN Track t ON t.id = r.trackId
    LEFT JOIN Album a ON a.id = t.albumId
    WHERE r.userId = ${userId} ${year ? sql`AND r.year = ${year}` : sql``}
  ), artists AS (
    SELECT 'id:' || a.id AS identity, a.id, a.name, SUM(e.plays) AS plays
    FROM events e JOIN _TrackToArtist ta ON ta.trackId = e.trackId
    JOIN Artist a ON a.id = ta.artistId GROUP BY a.id
    UNION ALL
    SELECT 'archive:' || e.archiveArtist, NULL, e.archiveArtist, SUM(e.plays)
    FROM events e WHERE NULLIF(trim(e.archiveArtist), '') IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM _TrackToArtist ta JOIN Artist a ON a.id = ta.artistId WHERE ta.trackId = e.trackId)
    GROUP BY e.archiveArtist
  ), albums AS (
    SELECT 'id:' || e.albumId AS identity, e.albumId AS id, e.albumName AS name, SUM(e.plays) AS plays
    FROM events e WHERE e.albumName IS NOT NULL GROUP BY e.albumId
    UNION ALL
    SELECT json_array(e.archiveArtist, e.archiveAlbum), NULL, e.archiveAlbum, SUM(e.plays)
    FROM events e WHERE e.albumName IS NULL AND NULLIF(trim(e.archiveAlbum), '') IS NOT NULL
    AND NULLIF(trim(e.archiveArtist), '') IS NOT NULL GROUP BY e.archiveArtist, e.archiveAlbum
  )`;
  return {
    totals: sql`${base} SELECT COALESCE(SUM(plays),0) AS played, COALESCE(SUM(milliseconds),0)/60000.0 AS minutes,
      COUNT(DISTINCT trackId) AS uniqueTracks, COALESCE(SUM(estimatedPlays),0) AS estimatedPlays, COALESCE(SUM(unknownPlays),0) AS unknownPlays,
      (SELECT COUNT(*) FROM artists) AS uniqueArtists, (SELECT COUNT(*) FROM albums) AS uniqueAlbums,
      (SELECT COUNT(*) FROM LikedTracks l WHERE l.userId = ${userId} AND l.action = 'liked' ${range(sql`l.createdAt`)}) AS liked
      FROM events`,
    days: sql`SELECT day AS key, SUM(plays) AS plays, SUM(milliseconds)/60000.0 AS minutes
      FROM ListeningDaySummary WHERE userId=${userId} ${year ? sql`AND year=${year}` : sql``} GROUP BY day ORDER BY day`,
    hourly: sql`SELECT hour AS key, SUM(plays) AS plays FROM ListeningDaySummary
      WHERE userId=${userId} ${year ? sql`AND year=${year}` : sql``} GROUP BY hour`,
    topTracks: sql`${base} SELECT trackId AS id, name, SUM(plays) AS plays FROM events GROUP BY trackId ORDER BY plays DESC, id LIMIT 5`,
    topArtists: sql`${base} SELECT id, name, plays FROM artists ORDER BY plays DESC, identity LIMIT 5`,
    topAlbums: sql`${base} SELECT id, name, plays FROM albums ORDER BY plays DESC, identity LIMIT 5`,
    years: sql`SELECT year FROM (SELECT year FROM AnalyticsYear WHERE userId = ${userId}
      UNION SELECT DISTINCT CAST(strftime('%Y', createdAt) AS INTEGER) FROM LikedTracks WHERE userId = ${userId}) WHERE year BETWEEN 1900 AND ${new Date().getUTCFullYear()} ORDER BY year DESC`,
  };
}

export function summarizeDashboard(
  totals: DashboardTotals,
  days: DashboardPeriod[],
  hours: { key: string; plays: number }[],
  year: number,
) {
  const monthly = new Map<string, DashboardPeriod>();
  if (year)
    for (let month = 1; month <= 12; month++) {
      const key = `${year}-${String(month).padStart(2, "0")}`;
      monthly.set(key, { key, plays: 0, minutes: 0 });
    }
  if (!year && days.length) {
    const first = new Date(`${days[0].key.slice(0, 7)}-01T00:00:00Z`);
    const last = days[days.length - 1].key.slice(0, 7);
    while (first.toISOString().slice(0, 7) <= last) {
      const key = first.toISOString().slice(0, 7);
      monthly.set(key, { key, plays: 0, minutes: 0 });
      first.setUTCMonth(first.getUTCMonth() + 1);
    }
  }
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (label) => ({ label, plays: 0 }),
  );
  let longestStreak = 0;
  let streak = 0;
  let previous = Number.NEGATIVE_INFINITY;
  let peakDay: DashboardPeriod | null = null;
  for (const day of days) {
    const timestamp = Date.parse(`${day.key}T00:00:00Z`);
    streak = timestamp - previous === 86_400_000 ? streak + 1 : 1;
    longestStreak = Math.max(longestStreak, streak);
    previous = timestamp;
    weekdays[(new Date(timestamp).getUTCDay() + 6) % 7].plays += day.plays;
    const key = day.key.slice(0, 7);
    const month = monthly.get(key) ?? { key, plays: 0, minutes: 0 };
    month.plays += day.plays;
    month.minutes += day.minutes;
    monthly.set(key, month);
    if (!peakDay || day.plays > peakDay.plays) peakDay = day;
  }
  return {
    ...totals,
    activeDays: days.length,
    longestStreak,
    peakDay,
    playsPerActiveDay: days.length ? totals.played / days.length : 0,
    minutesPerActiveDay: days.length ? totals.minutes / days.length : 0,
    repeatShare: totals.played
      ? ((totals.played - totals.uniqueTracks) / totals.played) * 100
      : 0,
    averageMinutes: totals.played ? totals.minutes / totals.played : 0,
    monthly: [...monthly.values()].sort((a, b) => a.key.localeCompare(b.key)),
    weekdays,
    hourly: Array.from({ length: 24 }, (_, hour) => ({
      label: `${String(hour).padStart(2, "0")}:00`,
      plays: hours.find((row) => Number(row.key) === hour)?.plays ?? 0,
    })),
  };
}
