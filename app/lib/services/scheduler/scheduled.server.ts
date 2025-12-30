import { syncUsers } from "./sync.server";

export default async function handleScheduled({
  controller,
  env,
  context,
}: {
  controller: { cron: string };
  env: any;
  context: { waitUntil: (promise: Promise<any>) => void };
}) {
  // Determine which sync to run based on the cron pattern
  if (controller.cron === "0 * * * *") {
    // Hourly cron - run recent sync
    context.waitUntil(syncUsers("recent"));
  } else if (controller.cron === "0 0 */7 * *") {
    // Weekly cron - run top sync and liked sync
    context.waitUntil(syncUsers("top"));
    context.waitUntil(syncUsers("liked"));
  }
}
