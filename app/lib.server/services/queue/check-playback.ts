import { env } from "cloudflare:workers";
import { db } from "~/lib.server/services/db";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
import { getNextQueueItemForDelivery } from "../db/queue";

export async function checkAndQueueDeliveries() {
  console.log("Checking for pending queue deliveries...");

  try {
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
        const nextItem = await getNextQueueItemForDelivery({
          groupId: group.id,
          userId,
        });

        if (nextItem) {
          console.log(
            `User ${userId} has undelivered track ${nextItem.trackId}, checking playback`,
          );

          try {
            const spotify = await getSpotifyClient({ userId });
            const playback = await spotify.player.getPlaybackState();

            if (playback?.is_playing) {
              console.log(
                `User ${userId} is listening, queuing delivery for group ${group.id}`,
              );
              deliveriesToQueue.push({
                groupId: group.id,
                userId,
              });
            } else {
              console.log(`User ${userId} is not listening`);
            }
          } catch (error) {
            console.error(`Error checking playback for user ${userId}:`, error);
          }
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
        console.log(
          `Queued delivery job for user ${delivery.userId} in group ${delivery.groupId}`,
        );
      } catch (error) {
        console.error(
          `Failed to queue delivery for user ${delivery.userId}:`,
          error,
        );
      }
    }

    console.log(
      `Successfully queued ${deliveriesToQueue.length} delivery jobs`,
    );
  } catch (error) {
    console.error("Error in checkAndQueueDeliveries:", error);
    throw error;
  }
}
