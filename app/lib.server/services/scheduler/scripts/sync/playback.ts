import { and, eq, inArray } from "drizzle-orm";
import { log, notNull } from "~/components/utils";
import { playback, provider, track } from "~/lib.server/db/schema";
import type { PlaybackState } from "~/lib.server/sdk/spotify";
import { db } from "~/lib.server/services/db";
import { getAllUsersId } from "~/lib.server/services/db/users";
import { createTrackModel, transformTracks } from "~/lib.server/services/sdk/helpers/spotify";
import { getSpotifyClient, type Spotified } from "~/lib.server/services/sdk/spotify";

export async function syncPlaybacks() {
  log("starting...", "playback");

  const users = await getAllUsersId();

  const playbacks = await Promise.all(
    users.map((userId) => getPlaybackState(userId)),
  );
  const active = playbacks.filter((u) => notNull(u.playback));

  log(`users active: ${active.length}`, "playback");

  for (const { id: userId, playback: playbackState, spotify } of active) {
    if (!playbackState) continue;
    const { item } = playbackState;
    const current = await db.query.playback.findFirst({
      where: eq(playback.userId, userId),
    });
    const isSameTrack = current?.trackId === item?.id;
    if (!item || item.type !== "track" || isSameTrack) continue;
    log("new track", "playback");

    await upsertPlayback(userId, playbackState, spotify);

    // const remaining = track.duration_ms - progress_ms;
    // schedulePlaybackCheck(userId, remaining);
    // log("created playbackQ job with delay", msToString(remaining));
  }

  await handleInactiveUsers(
    playbacks.filter((u) => !notNull(u.playback)).map((u) => u.id),
  );

  log("completed", "playback");
}

async function handleInactiveUsers(users: string[]) {
  if (users.length === 0) return;
  // Batch deletions to respect D1 param limit (100 params)
  const batchSize = 99;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    await db.delete(playback).where(inArray(playback.userId, batch));
  }
}

const upsertPlayback = async (
  userId: string,
  playbackState: PlaybackState,
  spotify: Spotified,
) => {
  try {
    log("upserting playback", "playback");
    const { progress_ms: progress, timestamp } = playbackState;
    if (
      !playbackState.item ||
      playbackState.item.type !== "track" ||
      !progress ||
      !timestamp
    )
      return;

    const trackItem = playbackState.item as any; // Cast as Track

    // Use transformTracks for enriched ingestion
    await transformTracks([trackItem], spotify);

    // Then upsert the playback
    const now = new Date().toISOString();
    await db
      .insert(playback)
      .values({
        userId,
        trackId: trackItem.id,
        progress,
        timestamp: Number(timestamp),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [playback.userId],
        set: {
          trackId: trackItem.id,
          progress,
          timestamp: Number(timestamp),
          updatedAt: now,
        },
      });
  } catch (error) {
    log(`failure upserting playback: ${error}`, "playback");
  }
};

async function getPlaybackState(userId: string) {
  try {
    const spotify = await getSpotifyClient({ userId });

    const playback = await spotify.player.getPlaybackState();
    const { is_playing, item } = playback;
    if (!is_playing || !item || item.type !== "track")
      return { id: userId, playback: null };

    return { id: userId, playback, spotify };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("revoked")) {
        log(`revoked token for ${userId}`, "playback");
        await db
          .update(provider)
          .set({ revoked: "1" })
          .where(
            and(eq(provider.userId, userId), eq(provider.type, "spotify")),
          );
      } else {
        log(`unknown: ${error.message}`, "playback");
      }
    } else {
      log(`unknown: ${error}`, "playback");
    }
  }

  return { id: userId, playback: null };
}
