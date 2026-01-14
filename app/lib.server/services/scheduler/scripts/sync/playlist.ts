import { and, eq, inArray } from "drizzle-orm";
import { log, logError, notNull } from "~/components/utils";
import { playlist, playlistTrack, sync, track } from "~/lib.server/db/schema";
import type { Track } from "~/lib.server/sdk/spotify";
import { db } from "~/lib.server/services/db";
import {
  createTrackModel,
  transformTracks,
} from "~/lib.server/services/sdk/helpers/spotify";
import type { Spotified } from "~/lib.server/services/sdk/spotify";

/**
 * Sync user's playlists from Spotify.
 *
 * This function:
 * 1. Fetches ALL user playlists from Spotify API
 * 2. Compares snapshot_id with database
 * 3. Only syncs playlists where snapshot_id changed or playlist doesn't exist
 * 4. For changed playlists: fetches full playlist details and tracks, updates playlist metadata, syncs tracks
 * 5. Handles pagination for playlists and tracks
 * 6. Respects Cloudflare D1 batch limits (100 params)
 */
export async function syncUserPlaylists({
  userId,
  spotify,
}: {
  userId: string;
  spotify: Spotified;
}) {
  try {
    log(`starting playlist sync for ${userId}`, "playlist");

    // Step 1: Fetch ALL user playlists from Spotify with pagination
    const spotifyPlaylistsMap = new Map<
      string,
      {
        id: string;
        name: string;
        description: string | null;
        uri: string;
        image: string;
        snapshotId: string;
        total: number;
      }
    >();

    let offset = 0;
    let total = 0;
    let hasMore = true;
    const MAX_PAGES = 50; // Safety limit: 50 pages * 50 = 2500 playlists max

    while (hasMore) {
      const response = await spotify.playlist.getCurrentUserPlaylists({
        limit: 50,
        offset,
      });

      if (!response.items || response.items.length === 0) {
        hasMore = false;
        break;
      }

      total = response.total || total;

      // Process each playlist
      for (const playlistData of response.items) {
        if (!playlistData.id || !playlistData.snapshot_id) continue;

        const imageUrl = playlistData.images?.[0]?.url || "";

        spotifyPlaylistsMap.set(playlistData.id, {
          id: playlistData.id,
          name: playlistData.name,
          description: playlistData.description || null,
          uri: playlistData.uri,
          image: imageUrl,
          snapshotId: playlistData.snapshot_id,
          total: playlistData.tracks?.total || 0,
        });
      }

      offset += response.items.length;
      hasMore = offset < total && offset < MAX_PAGES * 50;

      // Small delay to avoid rate limiting
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const spotifyPlaylistIds = Array.from(spotifyPlaylistsMap.keys());
    log(
      `fetched ${spotifyPlaylistIds.length} playlists from Spotify`,
      "playlist",
    );

    if (spotifyPlaylistIds.length === 0) {
      log("no playlists found", "playlist");
      await updateSyncMetadata(userId, "success");
      return;
    }

    // Step 2: Get current DB state
    const dbPlaylists = await db
      .select({
        id: playlist.id,
        snapshotId: playlist.snapshotId,
      })
      .from(playlist)
      .where(eq(playlist.userId, userId));

    const dbPlaylistsMap = new Map(
      dbPlaylists.map((p) => [p.id, p.snapshotId]),
    );
    const dbPlaylistIds = new Set(dbPlaylists.map((p) => p.id));

    // Step 3: Identify playlists to sync (new or changed snapshot_id)
    const playlistsToSync: string[] = [];
    const playlistsToCreate: string[] = [];

    for (const playlistId of spotifyPlaylistIds) {
      const spotifyData = spotifyPlaylistsMap.get(playlistId);
      if (!spotifyData) continue;

      if (!dbPlaylistIds.has(playlistId)) {
        playlistsToCreate.push(playlistId);
        playlistsToSync.push(playlistId);
      } else {
        const dbSnapshotId = dbPlaylistsMap.get(playlistId);
        if (dbSnapshotId !== spotifyData.snapshotId) {
          playlistsToSync.push(playlistId);
        }
      }
    }

    // Step 4: Identify playlists to remove (in DB but not in Spotify)
    const playlistsToRemove: string[] = [];
    for (const playlistId of dbPlaylistIds) {
      if (!spotifyPlaylistsMap.has(playlistId)) {
        playlistsToRemove.push(playlistId);
      }
    }

    log(
      `sync diff: +${playlistsToCreate.length} ~${playlistsToSync.length - playlistsToCreate.length} -${playlistsToRemove.length}`,
      "playlist",
    );

    // Step 5: Remove deleted playlists
    if (playlistsToRemove.length > 0) {
      // Delete playlist tracks first (foreign key constraint)
      const deleteBatchSize = 50;
      for (let i = 0; i < playlistsToRemove.length; i += deleteBatchSize) {
        const batch = playlistsToRemove.slice(i, i + deleteBatchSize);
        await db
          .delete(playlistTrack)
          .where(inArray(playlistTrack.playlistId, batch));
      }
      // Batch playlist deletion to respect D1 param limit (99 per batch due to and() condition)
      const playlistDeleteBatchSize = 99;
      for (
        let i = 0;
        i < playlistsToRemove.length;
        i += playlistDeleteBatchSize
      ) {
        const batch = playlistsToRemove.slice(i, i + playlistDeleteBatchSize);
        await db
          .delete(playlist)
          .where(and(eq(playlist.userId, userId), inArray(playlist.id, batch)));
      }
      log(`removed ${playlistsToRemove.length} playlists`, "playlist");
    }

    // Step 6: Create/update playlists
    const playlistsToInsert = playlistsToCreate
      .map((id) => {
        const data = spotifyPlaylistsMap.get(id);
        if (!data) return null;
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          uri: data.uri,
          image: data.image,
          userId,
          total: data.total,
          provider: "spotify" as const,
          snapshotId: data.snapshotId,
        };
      })
      .filter(notNull);

    if (playlistsToInsert.length > 0) {
      // D1 has 100 param limit, 9 columns = max 11 playlists per batch
      const batchSize = 11;
      for (let i = 0; i < playlistsToInsert.length; i += batchSize) {
        const batch = playlistsToInsert.slice(i, i + batchSize);
        await db.insert(playlist).values(batch).onConflictDoNothing();
      }
      log(`created ${playlistsToInsert.length} new playlists`, "playlist");
    }

    // Step 7: Sync tracks for changed playlists
    const syncedPlaylistIds = new Set<string>();
    for (const playlistId of playlistsToSync) {
      await syncPlaylistTracks({
        playlistId,
        spotify,
      });
      syncedPlaylistIds.add(playlistId);
    }

    // Step 7b: Sync descriptions for playlists that weren't synced above
    // This ensures descriptions stay in sync if they were changed in Spotify
    // (playlists already synced in Step 7 already have updated descriptions)
    const playlistsToCheckDescription = spotifyPlaylistIds.filter(
      (id) => !syncedPlaylistIds.has(id),
    );

    // Sync descriptions using data from the original fetch (Spotify takes precedence)
    if (playlistsToCheckDescription.length > 0) {
      const descriptionUpdates = playlistsToCheckDescription
        .map((playlistId) => {
          const spotifyData = spotifyPlaylistsMap.get(playlistId);
          if (!spotifyData) return null;
          return {
            playlistId,
            description: spotifyData.description,
          };
        })
        .filter(
          (
            update,
          ): update is { playlistId: string; description: string | null } =>
            update !== null,
        );

      // Batch update descriptions
      for (const { playlistId, description } of descriptionUpdates) {
        await db
          .update(playlist)
          .set({ description })
          .where(eq(playlist.id, playlistId));
      }
    }

    // Step 8: Update sync metadata
    await updateSyncMetadata(userId, "success");

    log(`completed playlist sync for ${userId}`, "playlist");
  } catch (error) {
    logError(`playlist sync failed for ${userId}: ${error}`);
    await updateSyncMetadata(userId, "failure");
    throw error;
  }
}

async function fetchAndInsertMissingTracks(
  trackIds: string[],
  spotify: Spotified,
): Promise<void> {
  if (trackIds.length === 0) return;

  // Check which tracks are missing (batch queries to respect D1 param limit)
  const existingTrackIds = new Set<string>();
  const queryBatchSize = 99; // D1 limit is 100 params
  for (let i = 0; i < trackIds.length; i += queryBatchSize) {
    const batch = trackIds.slice(i, i + queryBatchSize);
    const existingTracks = await db
      .select({ id: track.id })
      .from(track)
      .where(inArray(track.id, batch));
    for (const t of existingTracks) {
      existingTrackIds.add(t.id);
    }
  }
  const missingTrackIds = trackIds.filter((id) => !existingTrackIds.has(id));

  if (missingTrackIds.length === 0) return;

  log(
    `fetching ${missingTrackIds.length} missing tracks from Spotify`,
    "playlist",
  );

  // Fetch tracks from Spotify in batches of 50 (API limit)
  const batchSize = 50;
  const tracksToInsert: Track[] = [];

  for (let i = 0; i < missingTrackIds.length; i += batchSize) {
    const batch = missingTrackIds.slice(i, i + batchSize);
    try {
      const response = await spotify.track.getTracks(batch);
      if (response.tracks) {
        // Filter out null tracks (tracks that don't exist or are unavailable)
        const validTracks = response.tracks.filter(
          (t): t is Track => t !== null && t.id !== undefined,
        );
        tracksToInsert.push(...validTracks);
      }
    } catch (error) {
      logError(`failed to fetch tracks batch: ${error}`);
    }
  }

  // Insert fetched tracks
  if (tracksToInsert.length > 0) {
    await transformTracks(tracksToInsert, spotify);
    log(`inserted ${tracksToInsert.length} missing tracks`, "playlist");
  }
}

/**
 * Sync a single playlist's tracks from Spotify.
 * This function can be used independently or as part of syncing all playlists.
 */
export async function syncSinglePlaylist({
  playlistId,
  spotify,
  userId,
}: {
  playlistId: string;
  spotify: Spotified;
  userId: string;
}) {
  // Verify playlist exists in DB and belongs to user
  const dbPlaylist = await db
    .select()
    .from(playlist)
    .where(and(eq(playlist.id, playlistId), eq(playlist.userId, userId)))
    .limit(1);

  if (dbPlaylist.length === 0) {
    logError(`playlist ${playlistId} not found in DB for user ${userId}`);
    throw new Error("Playlist not found");
  }

  await syncPlaylistTracks({ playlistId, spotify });
}

async function syncPlaylistTracks({
  playlistId,
  spotify,
}: {
  playlistId: string;
  spotify: Spotified;
}) {
  log(`syncing tracks for playlist ${playlistId}`, "playlist");

  // Fetch full playlist to get updated metadata
  let fullPlaylist: Awaited<ReturnType<typeof spotify.playlist.getPlaylist>>;
  try {
    fullPlaylist = await spotify.playlist.getPlaylist(playlistId);
  } catch (error) {
    logError(`failed to fetch playlist ${playlistId}: ${error}`);
    return;
  }

  // Update playlist metadata
  const imageUrl = fullPlaylist.images?.[0]?.url || "";
  await db
    .update(playlist)
    .set({
      name: fullPlaylist.name,
      description: fullPlaylist.description || null,
      image: imageUrl,
      total: fullPlaylist.tracks?.total || 0,
      snapshotId: fullPlaylist.snapshot_id,
    })
    .where(eq(playlist.id, playlistId));

  // Fetch all tracks for this playlist
  const spotifyTracksMap = new Map<
    string,
    { trackId: string; addedAt: string; track: Track }
  >();

  let offset = 0;
  let total = 0;
  let hasMore = true;
  const MAX_PAGES = 200; // Safety limit: 200 pages * 50 = 10k tracks max

  while (hasMore) {
    const response = await spotify.playlist.getPlaylistTracks(playlistId, {
      limit: 50,
      offset,
    });

    if (!response.items || response.items.length === 0) {
      hasMore = false;
      break;
    }

    total = response.total || total;

    // Process each track
    for (const item of response.items) {
      if (!item.track || !item.track.id || !item.added_at) continue;

      // Handle both Track and null cases
      if (item.track.type === "track") {
        spotifyTracksMap.set(item.track.id, {
          trackId: item.track.id,
          addedAt: item.added_at,
          track: item.track as Track,
        });
      }
    }

    offset += response.items.length;
    hasMore = offset < total && offset < MAX_PAGES * 50;

    // Small delay to avoid rate limiting
    if (hasMore) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  const spotifyTrackIds = Array.from(spotifyTracksMap.keys());
  log(
    `fetched ${spotifyTrackIds.length} tracks for playlist ${playlistId}`,
    "playlist",
  );

  // Transform and insert tracks from playlist response
  const tracks = Array.from(spotifyTracksMap.values()).map((v) => v.track);
  await transformTracks(tracks, spotify);

  // Verify which tracks actually exist in DB (batch queries to respect D1 param limit)
  const existingTrackIds = new Set<string>();
  const queryBatchSize = 99; // D1 limit is 100 params
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

  // Fetch and insert any missing tracks from Spotify
  const missingTrackIds = spotifyTrackIds.filter(
    (id) => !existingTrackIds.has(id),
  );
  if (missingTrackIds.length > 0) {
    await fetchAndInsertMissingTracks(missingTrackIds, spotify);
    // Re-check existing tracks after fetching missing ones
    existingTrackIds.clear();
    for (let i = 0; i < spotifyTrackIds.length; i += queryBatchSize) {
      const batch = spotifyTrackIds.slice(i, i + queryBatchSize);
      const updatedExistingTracks = await db
        .select({ id: track.id })
        .from(track)
        .where(inArray(track.id, batch));
      for (const t of updatedExistingTracks) {
        existingTrackIds.add(t.id);
      }
    }
  }

  // Get current DB state for this playlist
  const dbPlaylistTracks = await db
    .select({
      trackId: playlistTrack.trackId,
      addedAt: playlistTrack.addedAt,
    })
    .from(playlistTrack)
    .where(eq(playlistTrack.playlistId, playlistId));

  const dbTracksMap = new Map(
    dbPlaylistTracks.map((pt) => [pt.trackId, pt.addedAt]),
  );
  const dbTrackIds = new Set(dbTracksMap.keys());

  // Calculate differences
  const spotifyTrackIdsSet = new Set(spotifyTrackIds);
  const toAdd: Array<{ trackId: string; addedAt: string }> = [];
  const toRemove: string[] = [];
  const toUpdate: Array<{ trackId: string; addedAt: string }> = [];

  // Find new tracks and tracks that need timestamp updates
  // Only include tracks that exist in the track table
  for (const trackId of spotifyTrackIds) {
    if (!existingTrackIds.has(trackId)) continue;

    const spotifyData = spotifyTracksMap.get(trackId);
    if (!spotifyData) continue;

    if (!dbTrackIds.has(trackId)) {
      toAdd.push({
        trackId: spotifyData.trackId,
        addedAt: spotifyData.addedAt,
      });
    } else {
      const dbTimestamp = dbTracksMap.get(trackId);
      if (dbTimestamp) {
        const dbDate = new Date(dbTimestamp);
        const spotifyDate = new Date(spotifyData.addedAt);
        if (dbDate.getTime() !== spotifyDate.getTime()) {
          toUpdate.push({
            trackId: spotifyData.trackId,
            addedAt: spotifyData.addedAt,
          });
        }
      }
    }
  }

  // Find tracks to remove (in DB but not in Spotify)
  for (const trackId of dbTrackIds) {
    if (!spotifyTrackIdsSet.has(trackId)) {
      toRemove.push(trackId);
    }
  }

  // Remove tracks
  if (toRemove.length > 0) {
    const deleteBatchSize = 50;
    for (let i = 0; i < toRemove.length; i += deleteBatchSize) {
      const batch = toRemove.slice(i, i + deleteBatchSize);
      await db
        .delete(playlistTrack)
        .where(
          and(
            eq(playlistTrack.playlistId, playlistId),
            inArray(playlistTrack.trackId, batch),
          ),
        );
    }
  }

  // Add new tracks
  if (toAdd.length > 0) {
    const playlistTracksToInsert = toAdd.map(({ trackId, addedAt }) => ({
      playlistId,
      trackId,
      addedAt: new Date(addedAt).toISOString(),
    }));

    // D1 has 100 param limit, 3 columns = max 33 per batch
    const batchSize = 33;
    for (let i = 0; i < playlistTracksToInsert.length; i += batchSize) {
      const batch = playlistTracksToInsert.slice(i, i + batchSize);
      await db.insert(playlistTrack).values(batch).onConflictDoNothing();
    }
  }

  // Update timestamps
  if (toUpdate.length > 0) {
    for (const { trackId, addedAt } of toUpdate) {
      await db
        .update(playlistTrack)
        .set({ addedAt: new Date(addedAt).toISOString() })
        .where(
          and(
            eq(playlistTrack.playlistId, playlistId),
            eq(playlistTrack.trackId, trackId),
          ),
        );
    }
  }

  log(
    `synced playlist ${playlistId}: +${toAdd.length} -${toRemove.length} ~${toUpdate.length}`,
    "playlist",
  );
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
      type: "playlist",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [sync.userId, sync.state, sync.type],
      set: { state, updatedAt: now },
    });
}
