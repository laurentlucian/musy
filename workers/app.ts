import { createRequestHandler, RouterContextProvider } from "react-router";
import {
  recoverAnalytics,
  refreshAnalytics,
} from "~/lib.server/services/analytics";
import { recoverArchiveCleanup } from "~/lib.server/services/account-cleanup";
import { archiveHistoryChunk } from "~/lib.server/services/history-archive";
import {
  processHistoryStats,
  recoverHistoryStats,
} from "~/lib.server/services/history-stats";
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
  syncUserStats,
  syncUserStatsAll,
} from "~/lib.server/services/scheduler/scripts/sync/stats";

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
  async scheduled(controller, env, ctx) {
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
      ctx.waitUntil(recoverAnalytics());
      ctx.waitUntil(recoverArchiveCleanup(env));
      ctx.waitUntil(
        (async () => {
          const pending = await env.D1.prepare(
            "SELECT userId FROM HistoryEvent WHERE archiveKey IS NULL GROUP BY userId LIMIT 5",
          ).all<{ userId: string }>();
          for (const { userId } of pending.results)
            await env.DELIVERY_QUEUE.send({ type: "history-archive", userId });
        })(),
      );
    }
  },
  async queue(batch, env, ctx) {
    for (const message of batch.messages) {
      const body = message.body as {
        type?: string;
        userId?: string;
        jobId?: string;
        year?: number;
      };
      if (body.type === "history-archive" && typeof body.userId === "string") {
        try {
          let more = true;
          for (let chunk = 0; chunk < 10 && more; chunk++)
            more = await archiveHistoryChunk(env, body.userId);
          if (more)
            await env.DELIVERY_QUEUE.send({
              type: "history-archive",
              userId: body.userId,
            });
          message.ack();
        } catch (error) {
          console.error("History archive transfer failed", { error });
          message.retry({ delaySeconds: 60 });
        }
        continue;
      }
      if (
        body.type === "analytics" &&
        typeof body.userId === "string" &&
        Number.isInteger(body.year)
      ) {
        try {
          const profile = await env.D1.prepare(
            "SELECT 1 FROM Profile WHERE id=?",
          )
            .bind(body.userId)
            .first();
          if (!profile) {
            message.ack();
            continue;
          }
          await refreshAnalytics(body.userId, body.year!);
          await syncUserStats({ userId: body.userId, year: body.year! });
          await syncUserStatsAll({ userId: body.userId });
          message.ack();
        } catch (error) {
          console.error("Analytics refresh failed", { error });
          message.retry({ delaySeconds: 60 });
        }
        continue;
      }
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
      if (body.type === "initial-import" && typeof body.userId === "string") {
        ctx.waitUntil(
          processInitialImport(body.userId).then(() => message.ack()),
        );
        continue;
      }
      const delivery = message.body as Partial<QueueDeliveryMessage>;
      if (
        typeof delivery.groupId !== "string" ||
        typeof delivery.userId !== "string"
      ) {
        message.ack();
        continue;
      }
      ctx.waitUntil(
        processQueueDelivery(env, delivery as QueueDeliveryMessage).then(
          () => message.ack(),
          () => message.retry({ delaySeconds: 60 }),
        ),
      );
    }
  },
} satisfies ExportedHandler<Env>;
