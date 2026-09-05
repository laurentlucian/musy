import { env } from "cloudflare:workers";
import { refreshAnalytics } from "./analytics";
import {
  syncUserStats,
  syncUserStatsAll,
} from "./scheduler/scripts/sync/stats";

const LEASE_MS = 10 * 60_000;

export async function processHistoryStats(userId: string, jobId: string) {
  const now = Date.now();
  const job = await env.D1.prepare(`UPDATE HistoryImport SET statsUpdatedAt=?
    WHERE userId=? AND jobId=? AND status='processing' AND statsUpdatedAt<?
    RETURNING statsYear`)
    .bind(now, userId, jobId, now - LEASE_MS)
    .first<{ statsYear: number }>();
  if (!job) return;
  try {
    const range =
      await env.D1.prepare(`SELECT MIN(CAST(substr(playedAt,1,4) AS INTEGER)) firstYear,
      MAX(CAST(substr(playedAt,1,4) AS INTEGER)) lastYear FROM HistoryEvent WHERE userId=?`)
        .bind(userId)
        .first<{ firstYear: number | null; lastYear: number | null }>();
    const year = job.statsYear === -1 ? range?.firstYear : job.statsYear;
    if (year != null) {
      await refreshAnalytics(userId, year);
      await syncUserStats({ userId, year });
    }
    const nextYear = year == null ? null : year + 1;
    const complete = nextYear == null || nextYear > (range?.lastYear ?? 0);
    if (complete) await syncUserStatsAll({ userId });
    const result =
      await env.D1.prepare(`UPDATE HistoryImport SET statsYear=?,statsUpdatedAt=0,status=?,updatedAt=?
      WHERE userId=? AND jobId=? AND statsUpdatedAt=? AND status='processing'`)
        .bind(
          complete ? null : nextYear,
          complete ? "complete" : "processing",
          Date.now(),
          userId,
          jobId,
          now,
        )
        .run();
    if (!complete && result.meta.changes)
      await env.DELIVERY_QUEUE.send({ type: "history-stats", userId, jobId });
  } catch (error) {
    await env.D1.prepare(
      "UPDATE HistoryImport SET statsUpdatedAt=0 WHERE userId=? AND jobId=? AND statsUpdatedAt=?",
    )
      .bind(userId, jobId, now)
      .run();
    throw error;
  }
}

export async function recoverHistoryStats() {
  const jobs = await env.D1.prepare(
    "SELECT userId,jobId FROM HistoryImport WHERE status='processing' AND statsUpdatedAt<? LIMIT 25",
  )
    .bind(Date.now() - LEASE_MS)
    .all<{ userId: string; jobId: string }>();
  for (const job of jobs.results)
    await env.DELIVERY_QUEUE.send({ type: "history-stats", ...job });
}
