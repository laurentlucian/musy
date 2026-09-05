import { env } from "cloudflare:workers";
import { log, logError } from "~/components/utils";
import { db } from "~/lib.server/services/db";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
import {
  getGroupMemberIds,
  getNextQueueItemForDelivery,
  getUniqueGroupUserIds,
  updatePlaybackStatus,
} from "../db/queue";
import { getAllUsersId } from "../db/users";

export async function checkAndQueueDeliveries() {
  try {
    const [groupUserIds, activeUserIds] = await Promise.all([
      getUniqueGroupUserIds(),
      getAllUsersId(),
    ]);
    const active = new Set(activeUserIds);
    const userIds = groupUserIds.filter((id) => active.has(id));
    if (userIds.length === 0) return;

    const playing = new Set<string>();

    const BATCH_SIZE = 10;
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const batch = userIds.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(async (userId) => {
          try {
            const spotify = await getSpotifyClient({ userId });
            const playbackState = await spotify.player.getPlaybackState();
            const isPlaying = playbackState?.is_playing ?? false;
            if (isPlaying) playing.add(userId);

            await updatePlaybackStatus({
              userId,
              playback: playbackState
                ? {
                    trackId: playbackState.item?.id,
                    progress: playbackState.progress_ms,
                    timestamp: playbackState.timestamp,
                    is_playing: isPlaying,
                  }
                : null,
            });
          } catch (error) {
            logError(
              `Error syncing playback for user ${userId}: ${error}`,
              "playback",
            );
          }
        }),
      );
    }

    if (playing.size === 0) return;

    const groups = await db.query.queueGroup.findMany({
      columns: { id: true, userId: true },
      with: { members: { columns: { userId: true } } },
    });

    const deliveries: { groupId: string; userId: string }[] = [];

    for (const group of groups) {
      for (const userId of getGroupMemberIds(group)) {
        if (!playing.has(userId)) continue;

        const nextItem = await getNextQueueItemForDelivery({
          groupId: group.id,
          userId,
        });
        if (nextItem) deliveries.push({ groupId: group.id, userId });
      }
    }

    if (deliveries.length === 0) return;

    log(`Queueing ${deliveries.length} delivery jobs`, "playback");
    await Promise.allSettled(
      deliveries.map((delivery) =>
        env.DELIVERY_QUEUE.send(delivery).catch((error) => {
          logError(
            `Failed to queue delivery for user ${delivery.userId}: ${error}`,
            "playback",
          );
        }),
      ),
    );
  } catch (error) {
    logError(`Error in checkAndQueueDeliveries: ${error}`, "playback");
    throw error;
  }
}
