import { getAllUsersId } from "~/lib/services/db/users.server";
import { syncUserRecent } from "~/lib/services/scheduler/scripts/sync/recent.server";
import { syncUserTop } from "~/lib/services/scheduler/scripts/sync/top.server";
import { getSpotifyClient } from "~/lib/services/sdk/spotify.server";
import { singleton } from "~/lib/services/singleton.server";
import { log, logError } from "~/lib/utils";

const SYNC_TYPES = ["top", "recent"] as const;
type SyncType = (typeof SYNC_TYPES)[number];

const SYNC_INTERVALS = {
  recent: 60 * 60 * 1000, // 1 hour (reduced from 30 minutes)
  top: 7 * 24 * 60 * 60 * 1000, // 7 days (reduced from 24 hours)
} as const;

const lastSync: Record<SyncType, number> = {
  recent: 0,
  top: 0,
};

function getSyncFunction(type: SyncType) {
  switch (type) {
    case "recent":
      return syncUserRecent;
    case "top":
      return syncUserTop;
  }
}

function isDue(type: SyncType) {
  const last = lastSync[type];
  const now = Date.now();
  return now - last >= SYNC_INTERVALS[type];
}

async function syncUsers(type: SyncType) {
  log(`starting ${type} sync`, "cron");

  try {
    const users = await getAllUsersId();
    log(`syncing ${type} for ${users.length} users`, "cron");

    const BATCH_SIZE = 3;
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(async (userId) => {
          try {
            const spotify = await getSpotifyClient({ userId });
            await getSyncFunction(type)({ userId, spotify });
          } catch (error) {
            logError(`${type} sync failed for ${userId}: ${error}`);
          }
        }),
      );

      if (i + BATCH_SIZE < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    lastSync[type] = Date.now();
    log(`completed ${type} sync`, "cron");
  } catch (error) {
    logError(`${type} sync failed: ${error}`);
  }
}

async function checkAndSync() {
  for (const type of SYNC_TYPES) {
    if (isDue(type)) {
      await syncUsers(type);
      return;
    }
  }
}

export function startSync() {
  return singleton("SYNC", () => {
    log("starting cron sync", "cron");

    // run every 5 minutes
    const interval = setInterval(checkAndSync, 5 * 60 * 1000);

    // run immediately on start
    void checkAndSync();

    const cleanup = () => {
      clearInterval(interval);
      log("stopped cron sync", "cron");
    };

    process.once("SIGTERM", cleanup);
    process.once("SIGINT", cleanup);

    return { cleanup };
  });
}
