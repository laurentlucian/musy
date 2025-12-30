import { and, eq, inArray } from "drizzle-orm";
import type Spotified from "spotified";
import { likedSongs, sync, track } from "~/lib/db/schema";
import { createDatabase } from "~/lib/services/db.server";
import { createTrackModel } from "~/lib/services/sdk/helpers/spotify.server";
import { log, notNull } from "~/lib/utils";

export async function syncUserLiked({
  userId,
  spotify,
  env,
}: {
  userId: string;
  spotify: Spotified;
  env: { musy: D1Database };
}) {
  const db = createDatabase(env);
  try {
    const { items } = await spotify.track.getUsersSavedTracks({ limit: 50 });

    // prepare tracks for batch creation/update
    const tracks = items
      .map(({ track }) => {
        if (!track) return null;
        return createTrackModel(track);
      })
      .filter(notNull);

    // deduplicate tracks within the batch
    const uniqueTracks = Array.from(
      new Map(tracks.map((t) => [t.id, t])).values(),
    );

    // find existing tracks
    const trackIds = uniqueTracks.map((t) => t.id);
    const existingTracks = await db
      .select({ id: track.id })
      .from(track)
      .where(inArray(track.id, trackIds));

    const existingTrackIds = new Set(existingTracks.map((t) => t.id));

    // split into new and existing tracks
    const newTracks = uniqueTracks.filter((t) => !existingTrackIds.has(t.id));

    // batch create new tracks (D1 has 100 param limit, 13 columns = max 7 tracks per batch)
    if (newTracks.length) {
      const tracksToInsert = newTracks.map((t) => ({
        ...t,
        explicit: t.explicit ? "1" : "0",
      }));
      const batchSize = 7;
      for (let i = 0; i < tracksToInsert.length; i += batchSize) {
        const batch = tracksToInsert.slice(i, i + batchSize);
        await db.insert(track).values(batch).onConflictDoNothing();
      }
    }

    // prepare liked songs data
    const likedSongsData = items
      .map(({ track }) => {
        if (!track?.id) return null;
        return {
          trackId: track.id,
          userId,
        };
      })
      .filter(notNull);

    // find existing liked songs
    const existingLiked = await db
      .select({ trackId: likedSongs.trackId })
      .from(likedSongs)
      .where(
        and(
          eq(likedSongs.userId, userId),
          inArray(likedSongs.trackId, trackIds),
        ),
      );

    const existingLikedIds = new Set(
      existingLiked.map((l: { trackId: string }) => l.trackId),
    );

    // create new liked songs (2 columns = max 45 per batch for safety)
    const newLiked = likedSongsData.filter(
      (l) => !existingLikedIds.has(l.trackId),
    );
    if (newLiked.length) {
      const batchSize = 45;
      for (let i = 0; i < newLiked.length; i += batchSize) {
        const batch = newLiked.slice(i, i + batchSize);
        await db.insert(likedSongs).values(batch);
      }
    }

    log("completed", "liked");
    const now = new Date().toISOString();
    await db
      .insert(sync)
      .values({
        userId,
        state: "success",
        type: "liked",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [sync.userId, sync.state, sync.type],
        set: { state: "success", updatedAt: now },
      });
  } catch (error) {
    console.log("error", error);
    log("failure", "liked");
    const now = new Date().toISOString();
    await db
      .insert(sync)
      .values({
        userId,
        state: "failure",
        type: "liked",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [sync.userId, sync.state, sync.type],
        set: { state: "failure", updatedAt: now },
      });
  }
}

export async function syncUserLikedPage({
  userId,
  spotify,
  offset,
  env,
}: {
  userId: string;
  spotify: Spotified;
  offset: number;
  env: { musy: D1Database };
}) {
  const db = createDatabase(env);
  try {
    const { items, total } = await spotify.track.getUsersSavedTracks({
      limit: 50,
      offset,
    });

    // prepare tracks for batch creation/update
    const tracks = items
      .map(({ track }) => {
        if (!track) return null;
        return createTrackModel(track);
      })
      .filter(notNull);

    // deduplicate tracks within the batch
    const uniqueTracks = Array.from(
      new Map(tracks.map((t) => [t.id, t])).values(),
    );

    // find existing tracks
    const trackIds = uniqueTracks.map((t) => t.id);
    const existingTracks = await db
      .select({ id: track.id })
      .from(track)
      .where(inArray(track.id, trackIds));

    const existingTrackIds = new Set(existingTracks.map((t) => t.id));

    // split into new and existing tracks
    const newTracks = uniqueTracks.filter((t) => !existingTrackIds.has(t.id));
    const tracksToUpdate = uniqueTracks.filter((t) =>
      existingTrackIds.has(t.id),
    );

    // batch create new tracks (D1 has 100 param limit, 13 columns = max 7 tracks per batch)
    if (newTracks.length) {
      const tracksToInsert = newTracks.map((t) => ({
        ...t,
        explicit: t.explicit ? "1" : "0",
      }));
      const batchSize = 7;
      for (let i = 0; i < tracksToInsert.length; i += batchSize) {
        const batch = tracksToInsert.slice(i, i + batchSize);
        await db.insert(track).values(batch).onConflictDoNothing();
      }
    }

    // batch update existing tracks
    if (tracksToUpdate.length) {
      await db.transaction(async (tx) => {
        for (const trackData of tracksToUpdate) {
          await tx
            .update(track)
            .set({
              ...trackData,
              explicit: trackData.explicit ? "1" : "0",
            })
            .where(eq(track.id, trackData.id));
        }
      });
    }

    // prepare liked songs data
    const likedSongsData = items
      .map(({ track }) => {
        if (!track?.id) return null;
        return {
          trackId: track.id,
          userId,
        };
      })
      .filter(notNull);

    // find existing liked songs
    const existingLiked = await db
      .select({ trackId: likedSongs.trackId })
      .from(likedSongs)
      .where(
        and(
          eq(likedSongs.userId, userId),
          inArray(likedSongs.trackId, trackIds),
        ),
      );

    const existingLikedIds = new Set(
      existingLiked.map((l: { trackId: string }) => l.trackId),
    );

    // create new liked songs (2 columns = max 45 per batch for safety)
    const newLiked = likedSongsData.filter(
      (l) => !existingLikedIds.has(l.trackId),
    );
    if (newLiked.length) {
      const batchSize = 45;
      for (let i = 0; i < newLiked.length; i += batchSize) {
        const batch = newLiked.slice(i, i + batchSize);
        await db.insert(likedSongs).values(batch);
      }
    }

    return {
      nextOffset: offset + items.length,
      total,
    };
  } catch (error) {
    log("failure", "liked-page");
    throw error;
  }
}
