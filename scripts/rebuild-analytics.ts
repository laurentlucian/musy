import { getPlatformProxy } from "wrangler";
import { analyticsRebuildStatements } from "../app/lib.server/services/analytics-query.ts";

const platform = await getPlatformProxy<Env>({ remoteBindings: true });
try {
  const database = platform.env.D1;
  const { results } = await database
    .prepare(
      "SELECT userId,year FROM AnalyticsYear WHERE revision<>publishedRevision ORDER BY userId,year",
    )
    .all<{ userId: string; year: number }>();
  const sql = analyticsRebuildStatements();
  for (const [index, { userId, year }] of results.entries()) {
    const result = await database.batch([
      database.prepare(sql[0]).bind(userId, year),
      database.prepare(sql[1]).bind(year, userId, year),
      database.prepare(sql[2]).bind(userId, year),
      database.prepare(sql[3]).bind(year, userId, year),
      database.prepare(sql[4]).bind(Date.now(), userId, year),
    ]);
    console.log(
      JSON.stringify({
        completed: index + 1,
        total: results.length,
        year,
        sqlMs: result.reduce((total, row) => total + row.meta.duration, 0),
      }),
    );
  }
} finally {
  await platform.dispose();
}
