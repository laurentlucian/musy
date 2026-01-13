import { createRequestHandler, RouterContextProvider } from "react-router";
import { checkAndQueueDeliveries } from "~/lib.server/services/queue/check-playback";
import {
  processQueueDelivery,
  type QueueDeliveryMessage,
} from "~/lib.server/services/queue/delivery";
import { enrichAlbums } from "~/lib.server/services/scheduler/scripts/enrich-albums";
import { enrichArtists } from "~/lib.server/services/scheduler/scripts/enrich-artists";
import { syncUsers } from "~/lib.server/services/scheduler/sync";

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
      // Every 5 minutes - enrich artists
      ctx.waitUntil(enrichArtists());
    } else if (cron === "*/3 * * * *") {
      // Every 3 minutes - enrich albums
      ctx.waitUntil(enrichAlbums());
    } else if (cron === "0 * * * *") {
      // Every hour - sync recent tracks
      ctx.waitUntil(syncUsers("recent"));
    } else if (cron === "0 */6 * * *") {
      // Every 6 hours - sync liked tracks
      ctx.waitUntil(syncUsers("liked"));
    } else if (cron === "0 0 * * *") {
      // Daily at midnight - sync user profiles
      ctx.waitUntil(syncUsers("profile"));
    } else if (cron === "0 1 * * *") {
      // Daily at 1 AM - sync stats
      ctx.waitUntil(syncUsers("stats"));
    } else if (cron === "0 0 * * 1") {
      // Weekly on Sunday at midnight - sync top tracks/artists and playlists
      ctx.waitUntil(syncUsers("top"));
      ctx.waitUntil(syncUsers("playlist"));
    } else if (cron === "* * * * *") {
      // Every minute - check Spotify playback and queue deliveries
      ctx.waitUntil(checkAndQueueDeliveries());
    }
  },
  async queue(batch, env, ctx) {
    for (const message of batch.messages) {
      ctx.waitUntil(
        processQueueDelivery(env, message.body as QueueDeliveryMessage).then(
          () => message.ack(),
        ),
      );
    }
  },
} satisfies ExportedHandler<Env>;
