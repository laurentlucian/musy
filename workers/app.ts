import { createRequestHandler, RouterContextProvider } from "react-router";
import { syncUsers } from "~/lib/services/scheduler/sync.server";

const handler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request) {
    return handler(request, new RouterContextProvider());
  },
  async scheduled(controller, _env, ctx) {
    const cron = controller.cron;

    if (cron === "0 */3 * * *") {
      // Every 3 hours - sync recent songs
      ctx.waitUntil(syncUsers("recent"));
    } else if (cron === "0 0 * * *") {
      // Daily at midnight - sync user profiles
      ctx.waitUntil(syncUsers("profile"));
    } else if (cron === "0 0 * * 1") {
      // Weekly on Sunday at midnight - sync top songs/artists
      ctx.waitUntil(syncUsers("top"));
    }
  },
} satisfies ExportedHandler<Env>;
