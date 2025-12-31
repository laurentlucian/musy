import { and, eq, inArray } from "drizzle-orm";
import { likedTracks } from "~/lib/db/schema";
import { getPlaylistTracksFromDB } from "~/lib/services/db/playlists.server";
import { db } from "~/lib/services/db.server";
import { SpotifyApiError } from "~/lib/services/sdk/spotify/errors";
import type { Spotified } from "~/lib/services/sdk/spotify.server";
import { log, logError } from "~/lib/utils";

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
          "playlist-actions",
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

export async function likePlaylistTracks({
  userId,
  playlistId,
  spotify,
}: {
  userId: string;
  playlistId: string;
  spotify: Spotified;
}) {
  const rateLimiter = new RateLimiter();

  try {
    log(`starting like playlist tracks for ${playlistId}`, "playlist-actions");

    const playlistTracks = await getPlaylistTracksFromDB(db, playlistId);

    if (playlistTracks.length === 0) {
      log("no tracks found in playlist", "playlist-actions");
      return { success: true, count: 0 };
    }

    const trackIds = playlistTracks.map((t) => t.trackId);

    const BATCH_SIZE = 50;
    let likedCount = 0;

    for (let i = 0; i < trackIds.length; i += BATCH_SIZE) {
      const batch = trackIds.slice(i, i + BATCH_SIZE);

      try {
        await rateLimiter.waitIfNeeded();
        await spotify.track.saveTracksforCurrentUser(batch);
        log(
          `liked ${batch.length} tracks (batch ${Math.floor(i / BATCH_SIZE) + 1})`,
          "playlist-actions",
        );
        likedCount += batch.length;
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
            `rate limit hit, waiting ${retryAfter}ms before retry`,
            "playlist-actions",
          );
          await new Promise((resolve) => setTimeout(resolve, retryAfter));
          await rateLimiter.waitIfNeeded();
          try {
            await spotify.track.saveTracksforCurrentUser(batch);
            log(
              `liked ${batch.length} tracks after retry (batch ${Math.floor(i / BATCH_SIZE) + 1})`,
              "playlist-actions",
            );
            likedCount += batch.length;
          } catch (retryError) {
            logError(
              `failed to like tracks after retry: ${formatError(retryError)}`,
            );
          }
        } else {
          logError(`failed to like tracks: ${formatError(error)}`);
        }
      }
    }

    const now = new Date().toISOString();
    const likedTracksToInsert = trackIds.map((trackId) => ({
      trackId,
      userId,
      createdAt: now,
    }));

    const INSERT_BATCH_SIZE = 33;
    for (let i = 0; i < likedTracksToInsert.length; i += INSERT_BATCH_SIZE) {
      const batch = likedTracksToInsert.slice(i, i + INSERT_BATCH_SIZE);
      await db.insert(likedTracks).values(batch).onConflictDoNothing();
    }

    log(`completed like playlist tracks: ${likedCount} liked`, "playlist-actions");

    return { success: true, count: likedCount };
  } catch (error) {
    logError(`like playlist tracks failed: ${formatError(error)}`);
    throw error;
  }
}

export async function unlikePlaylistTracks({
  userId,
  playlistId,
  spotify,
}: {
  userId: string;
  playlistId: string;
  spotify: Spotified;
}) {
  const rateLimiter = new RateLimiter();

  try {
    log(`starting unlike playlist tracks for ${playlistId}`, "playlist-actions");

    const playlistTracks = await getPlaylistTracksFromDB(db, playlistId);

    if (playlistTracks.length === 0) {
      log("no tracks found in playlist", "playlist-actions");
      return { success: true, count: 0 };
    }

    const trackIds = playlistTracks.map((t) => t.trackId);

    const BATCH_SIZE = 50;
    let unlikedCount = 0;

    for (let i = 0; i < trackIds.length; i += BATCH_SIZE) {
      const batch = trackIds.slice(i, i + BATCH_SIZE);

      try {
        await rateLimiter.waitIfNeeded();
        await spotify.track.removeTracksforCurrentUser(batch);
        log(
          `unliked ${batch.length} tracks (batch ${Math.floor(i / BATCH_SIZE) + 1})`,
          "playlist-actions",
        );
        unlikedCount += batch.length;
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
            `rate limit hit, waiting ${retryAfter}ms before retry`,
            "playlist-actions",
          );
          await new Promise((resolve) => setTimeout(resolve, retryAfter));
          await rateLimiter.waitIfNeeded();
          try {
            await spotify.track.removeTracksforCurrentUser(batch);
            log(
              `unliked ${batch.length} tracks after retry (batch ${Math.floor(i / BATCH_SIZE) + 1})`,
              "playlist-actions",
            );
            unlikedCount += batch.length;
          } catch (retryError) {
            logError(
              `failed to unlike tracks after retry: ${formatError(retryError)}`,
            );
          }
        } else {
          logError(`failed to unlike tracks: ${formatError(error)}`);
        }
      }
    }

    const DELETE_BATCH_SIZE = 50;
    for (let i = 0; i < trackIds.length; i += DELETE_BATCH_SIZE) {
      const batch = trackIds.slice(i, i + DELETE_BATCH_SIZE);
      await db
        .delete(likedTracks)
        .where(
          and(
            eq(likedTracks.userId, userId),
            inArray(likedTracks.trackId, batch),
          ),
        );
    }

    log(`completed unlike playlist tracks: ${unlikedCount} unliked`, "playlist-actions");

    return { success: true, count: unlikedCount };
  } catch (error) {
    logError(`unlike playlist tracks failed: ${formatError(error)}`);
    throw error;
  }
}
