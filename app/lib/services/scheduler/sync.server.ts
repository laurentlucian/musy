import { SpotifyApiError } from "spotified";
import { getAllUsersId, revokeUser } from "~/lib/services/db/users.server";
import { syncUserProfile } from "~/lib/services/scheduler/scripts/sync/profile.server";
import { syncUserRecent } from "~/lib/services/scheduler/scripts/sync/recent.server";
import { syncUserTop } from "~/lib/services/scheduler/scripts/sync/top.server";
import { getSpotifyClient } from "~/lib/services/sdk/spotify.server";
import { log, logError } from "~/lib/utils";

const SYNC_TYPES = ["top", "recent", "profile"] as const;
type SyncType = (typeof SYNC_TYPES)[number];

function getSyncFunction(type: SyncType) {
  switch (type) {
    case "recent":
      return syncUserRecent;
    case "top":
      return syncUserTop;
    case "profile":
      return syncUserProfile;
  }
}

export async function syncUsers(type: SyncType) {
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
            if (error instanceof SpotifyApiError) {
              if (error.message.includes("invalid_grant")) {
                await revokeUser(userId, "spotify");
              }
            }
          }
        }),
      );

      if (i + BATCH_SIZE < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    log(`completed ${type} sync`, "cron");
  } catch (error) {
    logError(`${type} sync failed: ${error}`);
  }
}
