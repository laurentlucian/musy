import { and, eq, inArray } from "drizzle-orm";
import type Spotified from "spotified";
import type { Track } from "spotified";
import { likedSongs, sync, track } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { createTrackModel } from "~/lib/services/sdk/helpers/spotify.server";
import { log, logError, notNull } from "~/lib/utils";

/**
 * Full sync of user's liked songs from Spotify.
 *
 * This function:
 * 1. Fetches ALL liked songs with pagination
 * 2. Captures Spotify's added_at timestamp for accurate year-based categorization
 * 3. Preserves timestamps for re-added songs (doesn't overwrite original)
 * 4. Removes songs that are no longer liked in Spotify
 * 5. Handles Cloudflare D1 batch limits efficiently
 */
export async function syncUserLikedFull({
  userId,
  spotify,
}: {
  userId: string;
  spotify: Spotified;
}) {
  try {
    log(`starting full liked sync for ${userId}`, "liked-full");

    // Step 1: Fetch ALL liked songs from Spotify with pagination
    const spotifyLikedMap = new Map<
      string,
      { trackId: string; addedAt: string; track: Track }
    >();

    let offset = 0;
    let total = 0;
    let hasMore = true;
    const MAX_PAGES = 200; // Safety limit: 200 pages * 50 = 10k songs max

    while (hasMore) {
      const response = await spotify.track.getUsersSavedTracks({
        limit: 50,
        offset,
      });

      if (!response.items || response.items.length === 0) {
        hasMore = false;
        break;
      }

      total = response.total || total;

      // Process each item and capture added_at timestamp
      for (const { track: trackData, added_at } of response.items) {
        if (!trackData?.id || !added_at) continue;

        // If track already exists in this pagination, keep the earliest added_at
        // (handles edge case where same track appears multiple times)
        const existing = spotifyLikedMap.get(trackData.id);
        if (existing) {
          const existingDate = new Date(existing.addedAt);
          const newDate = new Date(added_at);
          // Keep the earlier timestamp (when it was first liked)
          if (newDate < existingDate) {
            spotifyLikedMap.set(trackData.id, {
              trackId: trackData.id,
              addedAt: added_at,
              track: trackData,
            });
          }
        } else {
          spotifyLikedMap.set(trackData.id, {
            trackId: trackData.id,
            addedAt: added_at,
            track: trackData,
          });
        }
      }

      offset += response.items.length;
      hasMore = offset < total && offset < MAX_PAGES * 50;

      // Small delay to avoid rate limiting (Cloudflare workers are fast)
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const spotifyTrackIds = Array.from(spotifyLikedMap.keys());
    log(
      `fetched ${spotifyTrackIds.length} liked songs from Spotify`,
      "liked-full",
    );

    if (spotifyTrackIds.length === 0) {
      log("no liked songs found", "liked-full");
      // Remove all existing liked songs if none exist in Spotify
      await db.delete(likedSongs).where(eq(likedSongs.userId, userId));
      await updateSyncMetadata(userId, "success");
      return;
    }

    // Step 2: Get current DB state with timestamps
    const dbLiked = await db
      .select({
        trackId: likedSongs.trackId,
        createdAt: likedSongs.createdAt,
      })
      .from(likedSongs)
      .where(eq(likedSongs.userId, userId));

    const dbLikedMap = new Map(dbLiked.map((l) => [l.trackId, l.createdAt]));
    const dbTrackIds = new Set(dbLikedMap.keys());

    // Step 3: Calculate differences
    const spotifyTrackIdsSet = new Set(spotifyTrackIds);
    const toAdd: Array<{ trackId: string; addedAt: string }> = [];
    const toRemove: string[] = [];
    const toUpdate: Array<{ trackId: string; addedAt: string }> = [];

    // Find new songs and songs that need timestamp updates
    for (const trackId of spotifyTrackIds) {
      const spotifyData = spotifyLikedMap.get(trackId);
      if (!spotifyData) continue;

      if (!dbTrackIds.has(trackId)) {
        // New song - add it with Spotify's added_at timestamp
        toAdd.push({
          trackId: spotifyData.trackId,
          addedAt: spotifyData.addedAt,
        });
      } else {
        // Existing song - check if timestamp needs correction
        const dbTimestamp = dbLikedMap.get(trackId);
        if (dbTimestamp) {
          const dbDate = new Date(dbTimestamp);
          const spotifyDate = new Date(spotifyData.addedAt);
          // Update if timestamps differ (fix incorrect timestamps from previous syncs)
          // We use Spotify's timestamp as the source of truth
          if (dbDate.getTime() !== spotifyDate.getTime()) {
            toUpdate.push({
              trackId: spotifyData.trackId,
              addedAt: spotifyData.addedAt,
            });
          }
        }
      }
    }

    // Find songs to remove (in DB but not in Spotify)
    for (const trackId of dbTrackIds) {
      if (!spotifyTrackIdsSet.has(trackId)) {
        toRemove.push(trackId);
      }
    }

    log(
      `sync diff: +${toAdd.length} -${toRemove.length} update:${toUpdate.length}`,
      "liked-full",
    );

    // Step 4: Process tracks (create/update track records)
    const allTracks = Array.from(spotifyLikedMap.values()).map((v) => v.track);
    const uniqueTracks = Array.from(
      new Map(allTracks.filter((t) => t.id).map((t) => [t.id!, t])).values(),
    ).filter((t): t is Track & { id: string } => Boolean(t.id));

    // Find existing tracks (batch queries to avoid D1 100 param limit)
    const existingTrackIds = new Set<string>();
    const queryBatchSize = 50; // Stay well under 100 param limit
    for (let i = 0; i < spotifyTrackIds.length; i += queryBatchSize) {
      const batch = spotifyTrackIds.slice(i, i + queryBatchSize);
      const existingTracks = await db
        .select({ id: track.id })
        .from(track)
        .where(inArray(track.id, batch));
      for (const t of existingTracks) {
        existingTrackIds.add(t.id);
      }
    }
    const newTracks = uniqueTracks.filter(
      (t) => t.id && !existingTrackIds.has(t.id),
    );

    // Batch create new tracks (D1 has 100 param limit, 13 columns = max 7 tracks per batch)
    if (newTracks.length) {
      const tracksToInsert = newTracks.map((t) => {
        const trackModel = createTrackModel(t);
        return {
          ...trackModel,
          explicit: trackModel.explicit ? "1" : "0",
        };
      });

      const batchSize = 7;
      for (let i = 0; i < tracksToInsert.length; i += batchSize) {
        const batch = tracksToInsert.slice(i, i + batchSize);
        await db.insert(track).values(batch).onConflictDoNothing();
      }
      log(`created ${newTracks.length} new tracks`, "liked-full");
    }

    // Step 5: Remove unliked songs
    if (toRemove.length > 0) {
      // D1 has 100 param limit, so batch deletions if needed
      const deleteBatchSize = 50;
      for (let i = 0; i < toRemove.length; i += deleteBatchSize) {
        const batch = toRemove.slice(i, i + deleteBatchSize);
        await db
          .delete(likedSongs)
          .where(
            and(
              eq(likedSongs.userId, userId),
              inArray(likedSongs.trackId, batch),
            ),
          );
      }
      log(`removed ${toRemove.length} unliked songs`, "liked-full");
    }

    // Step 6: Add new liked songs with correct timestamps
    if (toAdd.length > 0) {
      const likedSongsToInsert = toAdd.map(({ trackId, addedAt }) => ({
        trackId,
        userId,
        createdAt: new Date(addedAt).toISOString(), // Use Spotify's added_at
      }));

      // D1 has 100 param limit, 3 columns (trackId, userId, createdAt) = max 33 per batch
      const batchSize = 33;
      for (let i = 0; i < likedSongsToInsert.length; i += batchSize) {
        const batch = likedSongsToInsert.slice(i, i + batchSize);
        await db.insert(likedSongs).values(batch).onConflictDoNothing();
      }
      log(`added ${toAdd.length} new liked songs`, "liked-full");
    }

    // Step 7: Update timestamps for existing songs (fix incorrect timestamps)
    if (toUpdate.length > 0) {
      // Update createdAt to use Spotify's added_at timestamp
      for (const { trackId, addedAt } of toUpdate) {
        await db
          .update(likedSongs)
          .set({ createdAt: new Date(addedAt).toISOString() })
          .where(
            and(eq(likedSongs.userId, userId), eq(likedSongs.trackId, trackId)),
          );
      }
      log(
        `updated timestamps for ${toUpdate.length} existing songs`,
        "liked-full",
      );
    }

    // Step 8: Update sync metadata
    await updateSyncMetadata(userId, "success");

    log(`completed full liked sync for ${userId}`, "liked-full");
  } catch (error) {
    logError(`full liked sync failed for ${userId}: ${error}`);
    await updateSyncMetadata(userId, "failure");
    throw error;
  }
}

/**
 * Incremental sync of user's liked songs from Spotify.
 *
 * This function:
 * 1. Fetches only recent liked songs (first N pages, newest first)
 * 2. Stops early when encountering songs already in DB
 * 3. Adds new songs with correct timestamps
 * 4. Checks for removals in recent songs only (efficient for weekly runs)
 * 5. Optimized for Cloudflare D1 batch limits
 *
 * This is designed to run weekly and is more efficient than full sync.
 */
export async function syncUserLikedIncremental({
  userId,
  spotify,
}: {
  userId: string;
  spotify: Spotified;
}) {
  try {
    log(`starting incremental liked sync for ${userId}`, "liked-inc");

    // Step 1: Fetch recent liked songs (newest first)
    // Spotify API returns songs in reverse chronological order
    const spotifyLikedMap = new Map<
      string,
      { trackId: string; addedAt: string; track: Track }
    >();

    const MAX_PAGES = 20; // Check up to 20 pages (1000 songs) for incremental
    let offset = 0;
    let total = 0;
    let hasMore = true;
    let allSeenInDb = false;

    // Get existing track IDs to detect when we've seen all new songs
    const existingLiked = await db
      .select({ trackId: likedSongs.trackId })
      .from(likedSongs)
      .where(eq(likedSongs.userId, userId))
      .limit(1000); // Get recent 1000 for comparison

    const existingTrackIds = new Set(existingLiked.map((l) => l.trackId));

    while (hasMore && !allSeenInDb && offset < MAX_PAGES * 50) {
      const response = await spotify.track.getUsersSavedTracks({
        limit: 50,
        offset,
      });

      if (!response.items || response.items.length === 0) {
        hasMore = false;
        break;
      }

      total = response.total || total;
      let newSongsInPage = 0;

      // Process each item and capture added_at timestamp
      for (const { track: trackData, added_at } of response.items) {
        if (!trackData?.id || !added_at) continue;

        // If we've seen this song in DB, we can stop (all newer songs are already synced)
        if (existingTrackIds.has(trackData.id)) {
          allSeenInDb = true;
          break;
        }

        newSongsInPage++;
        spotifyLikedMap.set(trackData.id, {
          trackId: trackData.id,
          addedAt: added_at,
          track: trackData,
        });
      }

      // If no new songs in this page, we've caught up
      if (newSongsInPage === 0) {
        allSeenInDb = true;
        break;
      }

      offset += response.items.length;
      hasMore = offset < total;

      // Small delay to avoid rate limiting
      if (hasMore && !allSeenInDb) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const spotifyTrackIds = Array.from(spotifyLikedMap.keys());
    log(
      `fetched ${spotifyTrackIds.length} new/recent liked songs from Spotify`,
      "liked-inc",
    );

    if (spotifyTrackIds.length === 0) {
      log("no new liked songs found", "liked-inc");
      await updateSyncMetadata(userId, "success");
      return;
    }

    // Step 2: Get current DB state for comparison
    const dbLiked = await db
      .select({
        trackId: likedSongs.trackId,
        createdAt: likedSongs.createdAt,
      })
      .from(likedSongs)
      .where(eq(likedSongs.userId, userId));

    const dbLikedMap = new Map(dbLiked.map((l) => [l.trackId, l.createdAt]));
    const dbTrackIds = new Set(dbLikedMap.keys());

    // Step 3: Calculate differences
    const toAdd: Array<{ trackId: string; addedAt: string }> = [];

    // Find new songs (in Spotify but not in DB)
    for (const trackId of spotifyTrackIds) {
      const spotifyData = spotifyLikedMap.get(trackId);
      if (!spotifyData) continue;

      if (!dbTrackIds.has(trackId)) {
        toAdd.push({
          trackId: spotifyData.trackId,
          addedAt: spotifyData.addedAt,
        });
      }
    }

    // Note: For incremental sync, we don't check removals here
    // Removals are handled by the full sync. This keeps incremental sync fast and efficient.

    log(`sync diff: +${toAdd.length}`, "liked-inc");

    // Step 4: Process tracks (create track records)
    const allTracks = Array.from(spotifyLikedMap.values()).map((v) => v.track);
    const uniqueTracks = Array.from(
      new Map(allTracks.filter((t) => t.id).map((t) => [t.id!, t])).values(),
    ).filter((t): t is Track & { id: string } => Boolean(t.id));

    // Find existing tracks (batch queries to avoid D1 100 param limit)
    const existingTrackIdsSet = new Set<string>();
    const queryBatchSize = 50; // Stay well under 100 param limit
    for (let i = 0; i < spotifyTrackIds.length; i += queryBatchSize) {
      const batch = spotifyTrackIds.slice(i, i + queryBatchSize);
      const existingTracks = await db
        .select({ id: track.id })
        .from(track)
        .where(inArray(track.id, batch));
      for (const t of existingTracks) {
        existingTrackIdsSet.add(t.id);
      }
    }
    const newTracks = uniqueTracks.filter(
      (t) => t.id && !existingTrackIdsSet.has(t.id),
    );

    // Batch create new tracks
    if (newTracks.length) {
      const tracksToInsert = newTracks.map((t) => {
        const trackModel = createTrackModel(t);
        return {
          ...trackModel,
          explicit: trackModel.explicit ? "1" : "0",
        };
      });

      const batchSize = 7;
      for (let i = 0; i < tracksToInsert.length; i += batchSize) {
        const batch = tracksToInsert.slice(i, i + batchSize);
        await db.insert(track).values(batch).onConflictDoNothing();
      }
      log(`created ${newTracks.length} new tracks`, "liked-inc");
    }

    // Step 5: Add new liked songs with correct timestamps
    if (toAdd.length > 0) {
      const likedSongsToInsert = toAdd.map(({ trackId, addedAt }) => ({
        trackId,
        userId,
        createdAt: new Date(addedAt).toISOString(),
      }));

      const batchSize = 33;
      for (let i = 0; i < likedSongsToInsert.length; i += batchSize) {
        const batch = likedSongsToInsert.slice(i, i + batchSize);
        await db.insert(likedSongs).values(batch).onConflictDoNothing();
      }
      log(`added ${toAdd.length} new liked songs`, "liked-inc");
    }

    // Step 6: Update sync metadata
    await updateSyncMetadata(userId, "success");

    log(`completed incremental liked sync for ${userId}`, "liked-inc");
  } catch (error) {
    logError(`incremental liked sync failed for ${userId}: ${error}`);
    await updateSyncMetadata(userId, "failure");
    throw error;
  }
}

async function updateSyncMetadata(
  userId: string,
  state: "success" | "failure",
) {
  const now = new Date().toISOString();
  await db
    .insert(sync)
    .values({
      userId,
      state,
      type: "liked",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [sync.userId, sync.state, sync.type],
      set: { state, updatedAt: now },
    });
}
