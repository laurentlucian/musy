import { queueItemDelivery } from "~/lib.server/db/schema";
import { db } from "~/lib.server/services/db";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
import {
  getNextQueueItemForDelivery,
  recordQueueItemDelivery,
} from "../db/queue";
import { log, logError } from "~/components/utils";

export interface QueueDeliveryMessage {
  groupId: string;
  userId: string;
}

export async function processQueueDelivery(
  _env: Env,
  message: QueueDeliveryMessage,
) {
  const { groupId, userId } = message;

  log(
    `Processing queue delivery for user ${userId} in group ${groupId}`,
    "delivery",
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
        log(`No more undelivered tracks for user ${userId}`, "delivery");
        break;
      }

      try {
        await spotify.player.addItemToPlaybackQueue(trackToDeliver.track.uri);
        await recordQueueItemDelivery({
          queueItemId: trackToDeliver.id,
          userId,
        });

        log(
          `Successfully queued track ${trackToDeliver.trackId} for user ${userId}`,
          "delivery",
        );
        deliveryCount++;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("UNIQUE constraint failed")
        ) {
          log(
            `Track ${trackToDeliver.trackId} already delivered, skipping`,
            "delivery",
          );
          continue;
        }
        throw error;
      }
    }

    if (deliveryCount > 0) {
      log(`Delivered ${deliveryCount} tracks to user ${userId}`, "delivery");
    }
  } catch (error) {
    logError(
      `Error processing queue delivery for user ${userId} in group ${groupId}: ${error}`,
      "delivery",
    );
    throw error;
  }
}
