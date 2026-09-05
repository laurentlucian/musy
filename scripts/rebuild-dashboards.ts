import { getPlatformProxy } from "wrangler";
import { refreshDashboardStore } from "../app/lib.server/services/dashboard-store";

const platform = await getPlatformProxy<Env>({ remoteBindings: true });
try {
  const { results } = await platform.env.D1.prepare(
    "SELECT userId,year FROM AnalyticsYear UNION SELECT id,0 FROM Profile ORDER BY userId,year",
  ).all<{ userId: string; year: number }>();
  for (const [index, { userId, year }] of results.entries()) {
    await refreshDashboardStore(platform.env.D1, userId, year);
    console.log(
      JSON.stringify({ completed: index + 1, total: results.length, year }),
    );
  }
} finally {
  await platform.dispose();
}
