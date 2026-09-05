import { createRequestHandler, RouterContextProvider } from "react-router";
import { checkAndQueueDeliveries } from "~/lib.server/services/queue/check-playback";
import {
  processQueueDelivery,
  type QueueDeliveryMessage,
} from "~/lib.server/services/queue/delivery";
import {
  processInitialImport,
  recoverInitialImports,
} from "~/lib.server/services/scheduler/initial-import";
import { syncUsers } from "~/lib.server/services/scheduler/sync";

import {
  processHistoryStats,
  recoverHistoryStats,
} from "~/lib.server/services/history-stats";
import {
  processHistoryLocations,
  recoverHistoryLocations,
} from "~/lib.server/services/history-geolocation";

const handler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === "musy.llabs.site") {
      url.hostname = "musy.olaurent.com";
      return Response.redirect(url.toString(), 301);
    }
    return handler(request, new RouterContextProvider());
  },
  async scheduled(controller, _env, ctx) {
    const cron = controller.cron;

    if (cron === "0 * * * *") {
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
      ctx.waitUntil(recoverInitialImports());
      ctx.waitUntil(recoverHistoryStats());
      ctx.waitUntil(recoverHistoryLocations());
    }
  },
  async queue(batch, env, ctx) {
    for (const message of batch.messages) {
      const body = message.body as {
        type?: string;
        userId?: string;
        jobId?: string;
      };
      if (
        body.type === "history-stats" &&
        typeof body.userId === "string" &&
        typeof body.jobId === "string"
      ) {
        try {
          await processHistoryStats(body.userId, body.jobId);
          message.ack();
        } catch {
          message.retry({ delaySeconds: 60 });
        }
        continue;
      }
      if (
        body.type === "history-geolocation" &&
        typeof body.userId === "string"
      ) {
        try {
          await processHistoryLocations(body.userId);
          message.ack();
        } catch {
          message.retry({ delaySeconds: 60 });
        }
        continue;
      }
      if (body.type === "initial-import" && typeof body.userId === "string") {
        ctx.waitUntil(
          processInitialImport(body.userId).then(() => message.ack()),
        );
        continue;
      }
      ctx.waitUntil(
        processQueueDelivery(env, message.body as QueueDeliveryMessage).then(
          () => message.ack(),
        ),
      );
    }
  },
} satisfies ExportedHandler<Env>;
