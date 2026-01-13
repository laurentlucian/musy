import { queueItemDelivery } from "~/lib.server/db/schema";
import { db } from "~/lib.server/services/db";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
import {
  getNextQueueItemForDelivery,
  recordQueueItemDelivery,
} from "../db/queue";

export interface QueueDeliveryMessage {
  groupId: string;
  userId: string;
}

export async function processQueueDelivery(
  _env: Env,
  message: QueueDeliveryMessage,
) {
  const { groupId, userId } = message;

  console.log(
    `Processing queue delivery for user ${userId} in group ${groupId}`,
  );

  try {
    const spotify = await getSpotifyClient({ userId });
    let deliveryCount = 0;
    const maxDeliveries = 10;

    while (deliveryCount < maxDeliveries) {
      const trackToDeliver = await getNextQueueItemForDelivery({
        groupId,
        userId,
      });

      if (!trackToDeliver) {
        console.log(`No more undelivered tracks for user ${userId}`);
        break;
      }

      try {
        await spotify.player.addItemToPlaybackQueue(trackToDeliver.track.uri);
        await recordQueueItemDelivery({
          queueItemId: trackToDeliver.id,
          userId,
        });

        console.log(
          `Successfully queued track ${trackToDeliver.trackId} for user ${userId}`,
        );
        deliveryCount++;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("UNIQUE constraint failed")
        ) {
          console.log(
            `Track ${trackToDeliver.trackId} already delivered, skipping`,
          );
          continue;
        }
        throw error;
      }
    }

    if (deliveryCount > 0) {
      console.log(`Delivered ${deliveryCount} tracks to user ${userId}`);
    }
  } catch (error) {
    console.error(
      `Error processing queue delivery for user ${userId} in group ${groupId}:`,
      error,
    );
    throw error;
  }
}
