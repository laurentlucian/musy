import { env } from "cloudflare:workers";
import { db } from "~/lib.server/services/db";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
import {
  getNextQueueItemForDelivery,
  updatePlaybackStatus,
} from "../db/queue";
import { getAllUsersId } from "../db/users";

export async function checkAndQueueDeliveries() {
  console.log("Syncing playback status for all users...");

  try {
    const userIds = await getAllUsersId();
    const activePlaybackByUserId = new Map<string, boolean>();

    // 1. Update playback status for ALL users in batches
    const BATCH_SIZE = 10;
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const batch = userIds.slice(i, i + BATCH_SIZE);
      
      await Promise.allSettled(
        batch.map(async (userId) => {
          try {
            const spotify = await getSpotifyClient({ userId });
            const playbackState = await spotify.player.getPlaybackState();

            const isPlaying = playbackState?.is_playing ?? false;
            activePlaybackByUserId.set(userId, isPlaying);

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
            console.error(`Error syncing playback for user ${userId}:`, error);
          }
        })
      );
    }

    console.log(`Synced ${userIds.length} users. Checking for pending queue deliveries...`);

    // 2. Check for deliveries ONLY for users who are currently playing
    const groups = await db.query.queueGroup.findMany({
      with: {
        members: true,
      },
    });

    const deliveriesToQueue: { groupId: string; userId: string }[] = [];

    for (const group of groups) {
      const recipientIds = [
        group.userId,
        ...group.members.map((m) => m.userId),
      ];

      for (const userId of recipientIds) {
        // Optimization: Only check for queue items if we know they are playing
        if (!activePlaybackByUserId.get(userId)) continue;

        const nextItem = await getNextQueueItemForDelivery({
          groupId: group.id,
          userId,
        });

        if (nextItem) {
          console.log(
            `User ${userId} has undelivered track ${nextItem.trackId}, queuing delivery for group ${group.id}`,
          );
          deliveriesToQueue.push({
            groupId: group.id,
            userId,
          });
        }
      }
    }

    if (deliveriesToQueue.length === 0) {
      console.log("No deliveries to queue");
      return;
    }

    console.log(`Queueing ${deliveriesToQueue.length} delivery jobs`);

    for (const delivery of deliveriesToQueue) {
      try {
        await env.DELIVERY_QUEUE.send(delivery);
      } catch (error) {
        console.error(
          `Failed to queue delivery for user ${delivery.userId}:`,
          error,
        );
      }
    }
  } catch (error) {
    console.error("Error in checkAndQueueDeliveries:", error);
    throw error;
  }
}
