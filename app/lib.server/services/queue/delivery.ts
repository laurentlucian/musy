import { log, logError } from "~/components/utils";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
import {
  claimQueueItemDelivery,
  getNextQueueItemForDelivery,
  releaseQueueItemDelivery,
} from "../db/queue";

export interface QueueDeliveryMessage {
  groupId: string;
  userId: string;
}

const MAX_DELIVERIES = 10;

export async function processQueueDelivery(
  _env: Env,
  message: QueueDeliveryMessage,
) {
  const { groupId, userId } = message;

  try {
    const spotify = await getSpotifyClient({ userId });
    let delivered = 0;

    for (let i = 0; i < MAX_DELIVERIES * 2 && delivered < MAX_DELIVERIES; i++) {
      const item = await getNextQueueItemForDelivery({ groupId, userId });
      if (!item) break;

      const claim = await claimQueueItemDelivery({
        queueItemId: item.id,
        userId,
      });
      if (!claim) continue;

      try {
        await spotify.player.addItemToPlaybackQueue(item.track.uri);
      } catch (error) {
        await releaseQueueItemDelivery(claim.id);
        throw error;
      }
      delivered++;
    }

    if (delivered > 0) {
      log(`Delivered ${delivered} tracks to user ${userId}`, "delivery");
    }
  } catch (error) {
    logError(
      `Error delivering queue ${groupId} to user ${userId}: ${error}`,
      "delivery",
    );
    throw error;
  }
}
