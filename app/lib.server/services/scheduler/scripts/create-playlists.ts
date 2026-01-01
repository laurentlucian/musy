import { and, eq, inArray } from "drizzle-orm";
import { log, logError } from "~/components/utils";
import { playlist, playlistTrack } from "~/lib.server/db/schema";
import { SpotifyApiError } from "~/lib.server/sdk/spotify/errors";
import { db } from "~/lib.server/services/db";
import {
  findExistingPlaylistByName,
  getLikedTracksByYear,
  getPlaylistTracksFromDB,
} from "~/lib.server/services/db/playlists";
import type { Spotified } from "~/lib.server/services/sdk/spotify";

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null) {
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return String(error);
    }
  }
  return String(error);
}

class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 280;
  private readonly windowMs = 30_000;

  async waitIfNeeded() {
    const now = Date.now();
    this.requests = this.requests.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest) + 100;
      if (waitTime > 0) {
        log(
          `rate limit: waiting ${Math.ceil(waitTime)}ms (${this.requests.length}/${this.maxRequests} requests in window)`,
          "create-playlists",
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        this.requests = this.requests.filter(
          (timestamp) => Date.now() - timestamp < this.windowMs,
        );
      }
    }

    this.requests.push(Date.now());
  }
}

export async function createPlaylistsByYear({
  userId,
  spotify,
}: {
  userId: string;
  spotify: Spotified;
}) {
  const rateLimiter = new RateLimiter();

  try {
    log(`starting playlist creation by year for ${userId}`, "create-playlists");

    await rateLimiter.waitIfNeeded();
    const userProfile = await spotify.user.getCurrentUserProfile();
    const spotifyUserId = userProfile.id;

    const tracksByYear = await getLikedTracksByYear(db, userId, "spotify");

    if (tracksByYear.size === 0) {
      log("no liked tracks found", "create-playlists");
      return { success: true, created: 0, updated: 0 };
    }

    let created = 0;
    let updated = 0;

    const sortedYears = Array.from(tracksByYear.entries()).sort(
      ([yearA], [yearB]) => yearA - yearB,
    );

    for (const [year, tracks] of sortedYears) {
      const yearAbbr = `'${year.toString().slice(-2)}`;
      const playlistName = yearAbbr;
      const description = `made by musy`;

      let playlistId: string;
      let existingPlaylist = await findExistingPlaylistByName(
        db,
        userId,
        yearAbbr,
      );

      if (existingPlaylist) {
        playlistId = existingPlaylist.id;
        log(`found existing playlist ${playlistName}`, "create-playlists");
      } else {
        await rateLimiter.waitIfNeeded();
        const newPlaylist = await spotify.playlist.createPlaylist(
          spotifyUserId,
          {
            name: playlistName,
            description,
            public: true,
          },
        );

        playlistId = newPlaylist.id;

        const imageUrl = newPlaylist.images?.[0]?.url || "";

        await db.insert(playlist).values({
          id: newPlaylist.id,
          name: newPlaylist.name,
          description: newPlaylist.description || null,
          uri: newPlaylist.uri,
          image: imageUrl,
          userId,
          total: newPlaylist.tracks?.total || 0,
          provider: "spotify",
          snapshotId: newPlaylist.snapshot_id,
        });

        existingPlaylist = await db.query.playlist.findFirst({
          where: eq(playlist.id, playlistId),
        });

        created++;
        log(`created playlist ${playlistName}`, "create-playlists");
      }

      const existingTracks = await getPlaylistTracksFromDB(db, playlistId);
      const existingTrackIds = new Set(existingTracks.map((t) => t.trackId));

      const tracksToAdd = tracks.filter(
        (t) => !existingTrackIds.has(t.trackId),
      );

      if (tracksToAdd.length === 0) {
        log(`playlist ${playlistName} already up to date`, "create-playlists");
        continue;
      }

      const trackUris = tracksToAdd.map((t) => t.uri);

      const BATCH_SIZE = 100;
      let latestSnapshotId: string | undefined;
      for (let i = 0; i < trackUris.length; i += BATCH_SIZE) {
        const batch = trackUris.slice(i, i + BATCH_SIZE);

        try {
          await rateLimiter.waitIfNeeded();
          const result = await spotify.playlist.addTracksToPlaylist(
            playlistId,
            batch,
          );
          latestSnapshotId = result.snapshot_id;
          log(
            `added ${batch.length} tracks to ${playlistName} (batch ${Math.floor(i / BATCH_SIZE) + 1})`,
            "create-playlists",
          );
        } catch (error) {
          const isRateLimit =
            error instanceof SpotifyApiError && error.status === 429;
          const isRateLimitMessage =
            error instanceof Error &&
            (error.message.includes("429") ||
              error.message.includes("rate limit") ||
              error.message.includes("Too Many Requests"));

          if (isRateLimit || isRateLimitMessage) {
            const retryAfter =
              error instanceof SpotifyApiError && error.retryAfter
                ? error.retryAfter * 1000
                : 2000;
            log(
              `rate limit hit, waiting ${retryAfter}ms before retry for ${playlistName}`,
              "create-playlists",
            );
            await new Promise((resolve) => setTimeout(resolve, retryAfter));
            await rateLimiter.waitIfNeeded();
            try {
              const result = await spotify.playlist.addTracksToPlaylist(
                playlistId,
                batch,
              );
              latestSnapshotId = result.snapshot_id;
              log(
                `added ${batch.length} tracks to ${playlistName} after retry (batch ${Math.floor(i / BATCH_SIZE) + 1})`,
                "create-playlists",
              );
            } catch (retryError) {
              logError(
                `failed to add tracks to ${playlistName} after retry: ${formatError(retryError)}`,
              );
            }
          } else {
            logError(
              `failed to add tracks to ${playlistName}: ${formatError(error)}`,
            );
          }
        }
      }

      const tracksToInsert = tracksToAdd.map((t) => ({
        playlistId,
        trackId: t.trackId,
        addedAt: t.createdAt,
      }));

      const INSERT_BATCH_SIZE = 33;
      for (let i = 0; i < tracksToInsert.length; i += INSERT_BATCH_SIZE) {
        const batch = tracksToInsert.slice(i, i + INSERT_BATCH_SIZE);
        await db.insert(playlistTrack).values(batch).onConflictDoNothing();
      }

      // Sync description from Spotify to ensure it's up to date
      let spotifyDescription: string | null = null;
      try {
        await rateLimiter.waitIfNeeded();
        const fullPlaylist = await spotify.playlist.getPlaylist(playlistId);
        spotifyDescription = fullPlaylist.description || null;
      } catch (error) {
        logError(
          `failed to fetch playlist description for ${playlistName}: ${formatError(error)}`,
        );
      }

      const currentTotal = existingTracks.length + tracksToAdd.length;
      await db
        .update(playlist)
        .set({
          total: currentTotal,
          ...(latestSnapshotId && { snapshotId: latestSnapshotId }),
          ...(spotifyDescription !== null && {
            description: spotifyDescription,
          }),
        })
        .where(eq(playlist.id, playlistId));

      updated++;
    }

    log(
      `completed playlist creation: ${created} created, ${updated} updated`,
      "create-playlists",
    );

    return { success: true, created, updated };
  } catch (error) {
    logError(`playlist creation failed for ${userId}: ${formatError(error)}`);
    throw error;
  }
}
