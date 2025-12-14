import { and, eq, inArray } from "drizzle-orm";
import type { PlaybackState } from "spotified";
import { playback, provider, track } from "~/lib/db/schema";
import { getAllUsersId } from "~/lib/services/db/users.server";
import { db } from "~/lib/services/db.server";
import { createTrackModel } from "~/lib/services/sdk/helpers/spotify.server";
import { getSpotifyClient } from "~/lib/services/sdk/spotify.server";
import { log, notNull } from "~/lib/utils";

export async function syncPlaybacks() {
  log("starting...", "playback");

  const users = await getAllUsersId();

  const playbacks = await Promise.all(
    users.map((userId) => getPlaybackState(userId)),
  );
  const active = playbacks.filter((u) => notNull(u.playback));

  log(`users active: ${active.length}`, "playback");

  for (const { id: userId, playback } of active) {
    if (!playback) continue;
    const { item } = playback;
    const current = await db.query.playback.findFirst({
      where: eq(playback.userId, Number(userId)),
    });
    const isSameTrack = current?.trackId === item?.id;
    if (!item || item.type !== "track" || isSameTrack) continue;
    log("new track", "playback");

    await upsertPlayback(userId, playback);

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
  await db.delete(playback).where(inArray(playback.userId, users));
}

const upsertPlayback = async (userId: string, playback: PlaybackState) => {
  try {
    log("upserting playback", "playback");
    const { progress_ms: progress, timestamp } = playback;
    if (
      !playback.item ||
      playback.item.type !== "track" ||
      !progress ||
      !timestamp
    )
      return;

    const trackData = createTrackModel(playback.item);

    // First, upsert the track
    await db
      .insert(track)
      .values({
        ...trackData,
        explicit: trackData.explicit ? "1" : "0",
      })
      .onConflictDoNothing();

    // Then upsert the playback
    const now = new Date().toISOString();
    await db
      .insert(playback)
      .values({
        userId,
        trackId: trackData.id,
        progress,
        timestamp: timestamp.toString(),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [playback.userId],
        set: {
          trackId: trackData.id,
          progress,
          timestamp: timestamp.toString(),
          updatedAt: now,
        },
      });
  } catch {
    log("failure upserting playback", "playback");
  }
};

async function getPlaybackState(userId: string) {
  try {
    const spotify = await getSpotifyClient({ userId });

    const playback = await spotify.player.getPlaybackState();
    const { is_playing, item } = playback;
    if (!is_playing || !item || item.type !== "track")
      return { id: userId, playback: null };

    return { id: userId, playback };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("revoked")) {
        log(`revoked token for ${userId}`, "playback");
        await db
          .update(provider)
          .set({ revoked: true })
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
