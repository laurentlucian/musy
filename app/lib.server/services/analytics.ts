import { env } from "cloudflare:workers";
import {
  analyticsNeedsRefresh,
  analyticsRebuildStatements,
} from "./analytics-query";

export async function refreshAnalytics(userId: string, year: number) {
  if (!Number.isInteger(year) || year < 1900 || year > 9999) return;
  const dirty = await env.D1.prepare(
    "SELECT 1 FROM AnalyticsYear WHERE userId=? AND year=? AND revision<>publishedRevision",
  )
    .bind(userId, year)
    .first();
  if (!dirty) return;
  const statements = analyticsRebuildStatements();
  await env.D1.batch([
    env.D1.prepare(statements[0]).bind(userId, year),
    env.D1.prepare(statements[1]).bind(year, userId, year),
    env.D1.prepare(statements[2]).bind(userId, year),
    env.D1.prepare(statements[3]).bind(year, userId, year),
    env.D1.prepare(statements[4]).bind(Date.now(), userId, year),
  ]);
}

export async function queueAnalytics(userId: string) {
  const years = await env.D1.prepare(
    `SELECT year FROM AnalyticsYear WHERE userId=? AND (${analyticsNeedsRefresh}) ORDER BY year DESC LIMIT 25`,
  )
    .bind(userId)
    .all<{ year: number }>();
  for (const { year } of years.results)
    await env.DELIVERY_QUEUE.send({ type: "analytics", userId, year });
}

export async function recoverAnalytics() {
  const rows = await env.D1.prepare(
    `SELECT userId,year FROM AnalyticsYear WHERE ${analyticsNeedsRefresh} ORDER BY updatedAt LIMIT 25`,
  ).all<{ userId: string; year: number }>();
  for (const row of rows.results)
    await env.DELIVERY_QUEUE.send({ type: "analytics", ...row });
}

export async function prepareAllTimeAnalytics(userId: string) {
  const rows = await env.D1.prepare(
    "SELECT year FROM AnalyticsYear WHERE userId=? AND revision<>publishedRevision ORDER BY year DESC LIMIT 2",
  )
    .bind(userId)
    .all<{ year: number }>();
  if (rows.results[0]) await refreshAnalytics(userId, rows.results[0].year);
  return rows.results.length < 2;
}
