import { getAllUsersId } from "@lib/services/db/users.server";
import { syncUserLiked } from "@lib/services/scheduler/scripts/sync/liked.server";
import { syncUserProfile } from "@lib/services/scheduler/scripts/sync/profile.server";
import { syncUserRecent } from "@lib/services/scheduler/scripts/sync/recent.server";
import { syncUserTop } from "@lib/services/scheduler/scripts/sync/top.server";
import { getSpotifyClient } from "@lib/services/sdk/spotify.server";
import { singleton } from "@lib/services/singleton.server";
import { log, logError } from "@lib/utils";

const SYNC_TYPES = ["top", "recent", "liked", "profile"] as const;
type SyncType = (typeof SYNC_TYPES)[number];

const SYNC_INTERVALS = {
  recent: 30 * 60 * 1000, // 30 minutes
  liked: 12 * 60 * 60 * 1000, // 12 hours
  top: 24 * 60 * 60 * 1000, // 24 hours
  profile: 24 * 60 * 60 * 1000, // 24 hours
} as const;

const lastSync: Record<SyncType, number> = {
  recent: 0,
  liked: 0,
  top: 0,
  profile: 0,
};

function getSyncFunction(type: SyncType) {
  switch (type) {
    case "profile":
      return syncUserProfile;
    case "recent":
      return syncUserRecent;
    case "liked":
      return syncUserLiked;
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

    const BATCH_SIZE = 5;
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
