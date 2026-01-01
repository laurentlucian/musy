import { createRequestHandler, RouterContextProvider } from "react-router";
import { enrichArtistsAndAlbums } from "~/lib/services/scheduler/scripts/enrich-artists-albums.server";
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

    if (cron === "*/5 * * * *") {
      // Every 5 minutes - enrich artists and albums
      ctx.waitUntil(enrichArtistsAndAlbums());
    } else if (cron === "0 */3 * * *") {
      // Every 3 hours - sync recent tracks
      ctx.waitUntil(syncUsers("recent"));
    } else if (cron === "0 0 * * *") {
      // Daily at midnight - sync user profiles
      ctx.waitUntil(syncUsers("profile"));
    } else if (cron === "0 1 * * *") {
      // Daily at 1 AM - sync stats
      ctx.waitUntil(syncUsers("stats"));
    } else if (cron === "0 0 * * 1") {
      // Weekly on Sunday at midnight - sync top tracks/artists and liked tracks
      ctx.waitUntil(syncUsers("top"));
      ctx.waitUntil(syncUsers("liked"));
      ctx.waitUntil(syncUsers("playlist"));
    }
  },
} satisfies ExportedHandler<Env>;
