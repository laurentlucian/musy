import { log, logError } from "~/components/utils";
import { SpotifyApiError } from "~/lib.server/sdk/spotify";
import { getAllUsersId, revokeUser } from "~/lib.server/services/db/users";
import {
  syncUserLikedFull,
  syncUserLikedIncremental,
} from "~/lib.server/services/scheduler/scripts/sync/liked";
import { syncUserPlaylists } from "~/lib.server/services/scheduler/scripts/sync/playlist";
import { syncUserProfile } from "~/lib.server/services/scheduler/scripts/sync/profile";
import { syncUserRecent } from "~/lib.server/services/scheduler/scripts/sync/recent";
import { syncAllUsersStats } from "~/lib.server/services/scheduler/scripts/sync/stats";
import { syncUserTop } from "~/lib.server/services/scheduler/scripts/sync/top";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";

const SYNC_TYPES = [
  "top",
  "recent",
  "profile",
  "liked",
  "liked-full",
  "playlist",
  "stats",
] as const;
type SyncType = (typeof SYNC_TYPES)[number];

function getSyncFunction(
  type: Exclude<SyncType, "stats">,
): (args: { userId: string; spotify: any }) => Promise<void> {
  switch (type) {
    case "recent":
      return syncUserRecent;
    case "top":
      return syncUserTop;
    case "profile":
      return syncUserProfile;
    case "liked":
      return syncUserLikedIncremental;
    case "liked-full":
      return syncUserLikedFull;
    case "playlist":
      return syncUserPlaylists;
  }
}

export async function syncUsers(type: SyncType) {
  log(`starting ${type} sync`, "cron");

  try {
    if (type === "stats") {
      await syncAllUsersStats();
      return;
    }

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
