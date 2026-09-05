import { sql } from "drizzle-orm";

export type ListeningStatsRow = {
  name: string;
  albumName: string | null;
  artistNames: string;
  plays: number;
  milliseconds: number;
};

export function listeningStatsQuery(userId: string, year?: number) {
  const from = year === undefined ? null : `${year}-01-01T00:00:00.000Z`;
  const until = year === undefined ? null : `${year + 1}-01-01T00:00:00.000Z`;
  return sql`
    SELECT t.name, COALESCE(a.name, h.albumName) AS albumName,
      CASE WHEN EXISTS (SELECT 1 FROM _TrackToArtist ta WHERE ta.trackId = t.id)
        THEN (SELECT json_group_array(ar.name) FROM _TrackToArtist ta
              JOIN Artist ar ON ar.id = ta.artistId WHERE ta.trackId = t.id)
        ELSE json_array(h.artistName) END AS artistNames,
      COUNT(*) AS plays, SUM(COALESCE(r.msPlayed, t.duration)) AS milliseconds
    FROM RecentTracks r JOIN Track t ON t.id = r.trackId
    LEFT JOIN Album a ON a.id = t.albumId
    LEFT JOIN HistoryEvent h ON h.id = r.historyEventId
    WHERE r.userId = ${userId}
      ${from ? sql`AND r.playedAt >= ${from} AND r.playedAt < ${until}` : sql``}
    GROUP BY t.id, COALESCE(a.name, h.albumName), h.artistName
  `;
}

export function calculateListeningStats(rows: ListeningStatsRow[]) {
  let minutes = 0;
  let played = 0;
  const artists: Record<string, number> = Object.create(null);
  const albums: Record<string, number> = Object.create(null);
  const tracks: Record<string, number> = Object.create(null);
  for (const row of rows) {
    played += row.plays;
    minutes += row.milliseconds / 60_000;
    tracks[row.name] = (tracks[row.name] ?? 0) + row.plays;
    if (row.albumName)
      albums[row.albumName] = (albums[row.albumName] ?? 0) + row.plays;
    for (const name of new Set(
      JSON.parse(row.artistNames) as (string | null)[],
    )) {
      if (name) artists[name] = (artists[name] ?? 0) + row.plays;
    }
  }
  return { played, minutes, artists, albums, tracks };
}
