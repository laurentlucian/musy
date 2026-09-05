import { getPlatformProxy } from "wrangler";
import { dashboardSnapshotState } from "../app/lib.server/services/dashboard-snapshot-query";

const platform = await getPlatformProxy<Env>({ remoteBindings: true });
try {
  const db = platform.env.D1;
  const owner = await db
    .prepare(
      "SELECT userId FROM HistoryExploreSummary WHERE kind='total' ORDER BY listens DESC LIMIT 1",
    )
    .first<{ userId: string }>();
  if (!owner) throw new Error("No listening history to verify");
  const checks = {
    exploreMismatch: `SELECT COUNT(*) mismatches FROM (
      SELECT userId,'total' kind,'' value,COUNT(*) listens,SUM(msPlayed) msPlayed FROM HistoryEvent GROUP BY userId
      UNION ALL SELECT userId,'country',COALESCE(UPPER(TRIM(country)),''),COUNT(*),SUM(msPlayed) FROM HistoryEvent GROUP BY userId,COALESCE(UPPER(TRIM(country)),'')
      UNION ALL SELECT userId,'platform',COALESCE(platform,''),COUNT(*),SUM(msPlayed) FROM HistoryEvent GROUP BY userId,COALESCE(platform,'')
      EXCEPT SELECT userId,kind,value,listens,msPlayed FROM HistoryExploreSummary)`,
    analyticsMismatch: `SELECT COUNT(*) mismatches FROM (
      SELECT r.userId,CAST(strftime('%Y',r.playedAt) AS INTEGER) year,COUNT(*) plays,SUM(COALESCE(r.msPlayed,t.duration,0)) milliseconds
      FROM RecentTracks r JOIN Track t ON t.id=r.trackId GROUP BY r.userId,year
      EXCEPT SELECT userId,year,SUM(plays),SUM(milliseconds) FROM ListeningTrackSummary GROUP BY userId,year)`,
    dayMismatch: `SELECT COUNT(*) mismatches FROM (
      SELECT userId,year,SUM(plays),SUM(milliseconds) FROM ListeningTrackSummary GROUP BY userId,year
      EXCEPT SELECT userId,year,SUM(plays),SUM(milliseconds) FROM ListeningDaySummary GROUP BY userId,year)`,
    archive:
      "SELECT COUNT(*) events,SUM(archiveKey IS NULL) unarchived,SUM(archiveKey IS NOT NULL AND rawJson<>'') inlineCopies,SUM(archiveKey IS NOT NULL AND (archiveChecksum IS NULL OR archiveOffset IS NULL)) incomplete FROM HistoryEvent",
  };
  for (const [name, sql] of Object.entries(checks)) {
    const result = await db.prepare(sql).all();
    console.log(
      JSON.stringify({
        name,
        result: result.results,
        sqlMs: result.meta.duration,
      }),
    );
    if (
      name !== "archive" &&
      Number((result.results[0] as { mismatches: number }).mismatches) !== 0
    )
      process.exitCode = 1;
  }
  const benchmarks = {
    exploreSummary: db
      .prepare(
        "SELECT kind,value,listens,msPlayed FROM HistoryExploreSummary WHERE userId=?",
      )
      .bind(owner.userId),
    exploreSongs: db
      .prepare(
        "SELECT id,trackId,trackName,artistName,playedAt,msPlayed,platform FROM HistoryEvent WHERE userId=? ORDER BY playedAt DESC,id DESC LIMIT 51",
      )
      .bind(owner.userId),
    exploreCount: db
      .prepare(
        "SELECT listens FROM HistoryExploreSummary WHERE userId=? AND kind='total' AND value=''",
      )
      .bind(owner.userId),
  };
  for (const [name, statement] of Object.entries(benchmarks)) {
    const result = await statement.all();
    console.log(
      JSON.stringify({
        name,
        sqlMs: result.meta.duration,
        rowsRead: result.meta.rows_read,
      }),
    );
  }
  const snapshot = await db
    .prepare(dashboardSnapshotState)
    .bind(owner.userId, 0)
    .all();
  console.log(
    JSON.stringify({
      name: "dashboardSnapshot",
      sqlMs: snapshot.meta.duration,
      rowsRead: snapshot.meta.rows_read,
    }),
  );
} finally {
  await platform.dispose();
}
