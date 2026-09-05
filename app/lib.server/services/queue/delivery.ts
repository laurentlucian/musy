import { log, logError } from "~/components/utils";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
import {
  getNextQueueItemForDelivery,
  recordQueueItemDelivery,
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

    while (delivered < MAX_DELIVERIES) {
      const item = await getNextQueueItemForDelivery({ groupId, userId });
      if (!item) break;

      await spotify.player.addItemToPlaybackQueue(item.track.uri);
      await recordQueueItemDelivery({ queueItemId: item.id, userId });
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
