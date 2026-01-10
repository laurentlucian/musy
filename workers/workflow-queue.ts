import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import {
  getNextQueueItemForDelivery,
  recordQueueItemDelivery,
} from "~/lib.server/services/db/queue";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";

export interface WorkflowQueueParams {
  groupId: string;
  userId: string;
}

export class WorkflowQueue extends WorkflowEntrypoint<
  Env,
  WorkflowQueueParams
> {
  async run(event: WorkflowEvent<WorkflowQueueParams>, step: WorkflowStep) {
    const { groupId, userId } = event.payload;

    // Continuous loop - workflow stays alive to process all tracks
    let trackIndex = 0;
    while (true) {
      // 1. Get next track to deliver
      const trackToDeliver = await step.do(
        `Get Next Track [${trackIndex}]`,
        async () => {
          return await getNextQueueItemForDelivery({ groupId, userId });
        },
      );

      // No tracks available - wait for event or timeout
      if (!trackToDeliver) {
        console.log(`No pending tracks for user ${userId} in group ${groupId}`);
        // Wait for a "track_added" event, or timeout after 30 minutes as a fallback
        await step.waitForEvent(`Wait for tracks [${trackIndex}]`, {
          type: "track_added",
          timeout: "30 minutes",
        });
        trackIndex++;
        continue;
      }

      // Wrap track delivery in try-catch to prevent entire workflow from crashing
      try {
        // 2. Wait until user is listening (retry every 30s)
        let isListening = false;
        let playbackCheckCount = 0;
        const maxPlaybackChecks = 120; // Stop after ~1 hour of checking

        while (!isListening && playbackCheckCount < maxPlaybackChecks) {
          const playbackResult = await step.do(
            `Check Playback [${trackIndex}-${playbackCheckCount}]`,
            {
              retries: {
                limit: 5,
                delay: "10 seconds",
                backoff: "exponential",
              },
              timeout: "30 seconds",
            },
            async () => {
              const spotify = await getSpotifyClient({ userId });
              const playback = await spotify.player.getPlaybackState();
              return { isPlaying: !!playback?.is_playing };
            },
          );

          isListening = playbackResult.isPlaying;

          if (!isListening) {
            await step.sleep(`Wait 30s [${trackIndex}-${playbackCheckCount}]`, "30 seconds");
            playbackCheckCount++;
          }
        }

        // If user never started listening, skip this track for now and try next
        if (!isListening) {
          console.log(`User ${userId} not listening after ${maxPlaybackChecks} checks, skipping track`);
          trackIndex++;
          continue;
        }

        // 3. Queue the track and record delivery
        await step.do(
          `Queue Track [${trackIndex}]`,
          {
            retries: {
              limit: 5,
              delay: "10 seconds",
              backoff: "exponential",
            },
            timeout: "60 seconds",
          },
          async () => {
            const spotify = await getSpotifyClient({ userId });
            await spotify.player.addItemToPlaybackQueue(trackToDeliver.track.uri);
            await recordQueueItemDelivery({
              queueItemId: trackToDeliver.id,
              userId,
            });
            return { success: true };
          },
        );
      } catch (error) {
        // Log error but don't crash - continue to next track
        console.error(
          `Failed to deliver track ${trackToDeliver.id} to user ${userId}:`,
          error,
        );
        // Wait a bit before trying next track to avoid rapid error loops
        await step.sleep(`Error recovery [${trackIndex}]`, "1 minute");
      }

      trackIndex++;
    }
  }
}
