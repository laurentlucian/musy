import { env } from "cloudflare:workers";
import { eq, inArray, or } from "drizzle-orm";
import { log, logError } from "~/components/utils";
import { album, artist } from "~/lib.server/db/schema";
import { createSpotifyClient, SpotifyApiError } from "~/lib.server/sdk/spotify";
import { spotifyFetch } from "~/lib.server/sdk/spotify/fetch";
import type { Artist, Artists } from "~/lib.server/sdk/spotify/types";
import { db } from "~/lib.server/services/db";
import {
  getAllUsersId,
  getProvider,
  updateToken,
} from "~/lib.server/services/db/users";

function serializeError(error: unknown): string {
  if (error instanceof Error) {
    const errorObj: Record<string, unknown> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    if (error instanceof SpotifyApiError) {
      errorObj.status = error.status;
      errorObj.retryAfter = error.retryAfter;
    }

    const errorWithCause = error as { cause?: unknown };
    if (errorWithCause.cause) {
      errorObj.cause = serializeError(errorWithCause.cause);
    }

    return JSON.stringify(errorObj, null, 2);
  }
  return JSON.stringify(error, null, 2);
}

interface AlbumResponse {
  id: string;
  name: string;
  images: Array<{ url: string; height: number | null; width: number | null }>;
  popularity: number;
}

interface AlbumsResponse {
  albums: AlbumResponse[];
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
          "enrich",
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

async function getAccessToken(userId?: string): Promise<{
  token: string;
  userId: string;
}> {
  const users = await getAllUsersId();
  if (users.length === 0) {
    throw new Error("No users found for enrichment");
  }

  const targetUserId = userId || users[0];
  const provider = await getProvider({
    userId: targetUserId,
    type: "spotify",
  });

  if (!provider) {
    throw new Error("No Spotify provider found");
  }

  // check if token needs refresh
  const buffer = 60 * 1000; // 60 seconds buffer
  const now = Date.now();
  const expiresAt = Number(provider.expiresAt);

  if (expiresAt && expiresAt > now + buffer) {
    return { token: provider.accessToken, userId: targetUserId };
  }

  try {
    log(`refreshing token for ${targetUserId}`, "enrich");

    const spotify = createSpotifyClient({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      accessToken: provider.accessToken,
    });

    const response = await spotify.auth.AuthorizationCode.refreshAccessToken(
      provider.refreshToken,
    );

    const newAccessToken = response.access_token;
    const newRefreshToken = response.refresh_token ?? provider.refreshToken;
    const newExpiresAt = Date.now() + response.expires_in * 1000;

    await updateToken({
      id: targetUserId,
      token: newAccessToken,
      expiresAt: newExpiresAt,
      refreshToken: newRefreshToken,
      type: "spotify",
    });

    log(`token refreshed successfully for ${targetUserId}`, "enrich");
    return { token: newAccessToken, userId: targetUserId };
  } catch (error) {
    logError(
      `token refresh failed for ${targetUserId}: ${serializeError(error)}`,
    );
    throw error;
  }
}

async function enrichArtists(
  accessToken: string,
  userId: string,
  rateLimiter: RateLimiter,
) {
  const artistsToEnrich = await db
    .select({ id: artist.id })
    .from(artist)
    .where(
      or(eq(artist.image, ""), eq(artist.popularity, 0), eq(artist.genres, "")),
    )
    .limit(100);

  if (artistsToEnrich.length === 0) {
    log("no artists to enrich", "enrich");
    return;
  }

  const total = artistsToEnrich.length;
  log(`enriching ${total} artists`, "enrich");

  const ARTIST_BATCH_SIZE = 10;
  let enriched = 0;
  const totalBatches = Math.ceil(total / ARTIST_BATCH_SIZE);

  for (let i = 0; i < artistsToEnrich.length; i += ARTIST_BATCH_SIZE) {
    const currentBatch = Math.floor(i / ARTIST_BATCH_SIZE) + 1;
    const batch = artistsToEnrich.slice(i, i + ARTIST_BATCH_SIZE);
    const artistIds = batch.map((a) => a.id);

    try {
      await rateLimiter.waitIfNeeded();

      const response = await spotifyFetch<Artists>(
        "https://api.spotify.com/v1/artists",
        {
          token: accessToken,
          query: { ids: artistIds.join(",") },
        },
      );

      const updates = response.artists
        .filter((a): a is Artist => a !== null && a.id !== undefined)
        .map((a) => ({
          id: a.id!,
          image: a.images?.[0]?.url || "",
          popularity: a.popularity ?? 0,
          genres: a.genres?.join(",") || "",
        }));

      if (updates.length > 0) {
        // Batch fetch existing artists to avoid hitting D1 API request limit
        const updateIds = updates.map((u) => u.id);
        const existingArtists = await db
          .select()
          .from(artist)
          .where(inArray(artist.id, updateIds));

        const existingMap = new Map(existingArtists.map((a) => [a.id, a]));

        let batchEnriched = 0;
        for (const update of updates) {
          const existing = existingMap.get(update.id);

          if (!existing) continue;

          const updateData: {
            image?: string;
            popularity?: number;
            genres?: string;
          } = {};

          if (update.image && existing.image === "") {
            updateData.image = update.image;
          }
          if (update.popularity > 0 && existing.popularity === 0) {
            updateData.popularity = update.popularity;
          }
          if (update.genres && existing.genres === "") {
            updateData.genres = update.genres;
          }

          if (Object.keys(updateData).length > 0) {
            await db
              .update(artist)
              .set(updateData)
              .where(eq(artist.id, update.id));
            enriched++;
            batchEnriched++;
          }
        }
        if (batchEnriched > 0) {
          const remainingAfter = total - (i + ARTIST_BATCH_SIZE);
          const progressAfter = Math.round(
            ((i + ARTIST_BATCH_SIZE) / total) * 100,
          );
          log(
            `enriched ${batchEnriched} artists in batch ${currentBatch}/${totalBatches} (${enriched} total, ${remainingAfter} remaining, ${progressAfter}% complete)`,
            "enrich",
          );
        } else {
          const remainingAfter = total - (i + ARTIST_BATCH_SIZE);
          const progressAfter = Math.round(
            ((i + ARTIST_BATCH_SIZE) / total) * 100,
          );
          log(
            `batch ${currentBatch}/${totalBatches} completed (${remainingAfter} remaining, ${progressAfter}% complete)`,
            "enrich",
          );
        }
      }
    } catch (error) {
      const isUnauthorized =
        error instanceof SpotifyApiError && error.status === 401;
      const isUnauthorizedMessage =
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.includes("expired") ||
          error.message.includes("Unauthorized"));

      if (isUnauthorized || isUnauthorizedMessage) {
        log("access token expired, refreshing and retrying", "enrich");
        try {
          const { token: newToken } = await getAccessToken(userId);
          await rateLimiter.waitIfNeeded();
          const response = await spotifyFetch<Artists>(
            "https://api.spotify.com/v1/artists",
            {
              token: newToken,
              query: { ids: artistIds.join(",") },
            },
          );

          const updates = response.artists
            .filter((a): a is Artist => a !== null && a.id !== undefined)
            .map((a) => ({
              id: a.id!,
              image: a.images?.[0]?.url || "",
              popularity: a.popularity ?? 0,
              genres: a.genres?.join(",") || "",
            }));

          if (updates.length > 0) {
            // Batch fetch existing artists to avoid hitting D1 API request limit
            const updateIds = updates.map((u) => u.id);
            const existingArtists = await db
              .select()
              .from(artist)
              .where(inArray(artist.id, updateIds));

            const existingMap = new Map(existingArtists.map((a) => [a.id, a]));

            let batchEnriched = 0;
            for (const update of updates) {
              const existing = existingMap.get(update.id);

              if (!existing) continue;

              const updateData: {
                image?: string;
                popularity?: number;
                genres?: string;
              } = {};

              if (update.image && existing.image === "") {
                updateData.image = update.image;
              }
              if (update.popularity > 0 && existing.popularity === 0) {
                updateData.popularity = update.popularity;
              }
              if (update.genres && existing.genres === "") {
                updateData.genres = update.genres;
              }

              if (Object.keys(updateData).length > 0) {
                await db
                  .update(artist)
                  .set(updateData)
                  .where(eq(artist.id, update.id));
                enriched++;
                batchEnriched++;
              }
            }
            if (batchEnriched > 0) {
              log(
                `enriched ${batchEnriched} artists in batch ${Math.floor(i / ARTIST_BATCH_SIZE) + 1} (${enriched} total)`,
                "enrich",
              );
            }
          }
          continue;
        } catch (retryError) {
          logError(
            `failed to retry after token refresh: ${serializeError(retryError)}`,
          );
        }
      }

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
        log(`rate limit hit, waiting ${retryAfter}ms before retry`, "enrich");
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
        await rateLimiter.waitIfNeeded();
        continue;
      }

      logError(`failed to enrich artists batch: ${serializeError(error)}`);
    }
  }

  log(
    `completed enriching artists: ${enriched}/${total} enriched (${total - enriched} skipped or failed)`,
    "enrich",
  );
}

async function enrichAlbums(
  accessToken: string,
  userId: string,
  rateLimiter: RateLimiter,
) {
  const albumsToEnrich = await db
    .select({ id: album.id })
    .from(album)
    .where(or(eq(album.image, ""), eq(album.popularity, 0)))
    .limit(100);

  if (albumsToEnrich.length === 0) {
    log("no albums to enrich", "enrich");
    return;
  }

  const total = albumsToEnrich.length;
  log(`enriching ${total} albums`, "enrich");

  const ALBUM_BATCH_SIZE = 5;
  let enriched = 0;
  const totalBatches = Math.ceil(total / ALBUM_BATCH_SIZE);

  for (let i = 0; i < albumsToEnrich.length; i += ALBUM_BATCH_SIZE) {
    const currentBatch = Math.floor(i / ALBUM_BATCH_SIZE) + 1;
    const batch = albumsToEnrich.slice(i, i + ALBUM_BATCH_SIZE);
    const albumIds = batch.map((a) => a.id);

    try {
      await rateLimiter.waitIfNeeded();

      const response = await spotifyFetch<AlbumsResponse>(
        "https://api.spotify.com/v1/albums",
        {
          token: accessToken,
          query: { ids: albumIds.join(",") },
        },
      );

      const updates = response.albums
        .filter((a): a is AlbumResponse => a !== null && a.id !== undefined)
        .map((a) => ({
          id: a.id,
          image: a.images?.[0]?.url || "",
          popularity: a.popularity ?? 0,
        }));

      if (updates.length > 0) {
        // Batch fetch existing albums to avoid hitting D1 API request limit
        const updateIds = updates.map((u) => u.id);
        const existingAlbums = await db
          .select()
          .from(album)
          .where(inArray(album.id, updateIds));

        const existingMap = new Map(existingAlbums.map((a) => [a.id, a]));

        let batchEnriched = 0;
        for (const update of updates) {
          const existing = existingMap.get(update.id);

          if (!existing) continue;

          const updateData: {
            image?: string;
            popularity?: number;
          } = {};

          if (update.image && existing.image === "") {
            updateData.image = update.image;
          }
          if (existing.popularity === 0) {
            updateData.popularity = update.popularity;
          }

          if (Object.keys(updateData).length > 0) {
            await db
              .update(album)
              .set(updateData)
              .where(eq(album.id, update.id));
            enriched++;
            batchEnriched++;
          }
        }
        if (batchEnriched > 0) {
          const remainingAfter = total - (i + ALBUM_BATCH_SIZE);
          const progressAfter = Math.round(
            ((i + ALBUM_BATCH_SIZE) / total) * 100,
          );
          log(
            `enriched ${batchEnriched} albums in batch ${currentBatch}/${totalBatches} (${enriched} total, ${remainingAfter} remaining, ${progressAfter}% complete)`,
            "enrich",
          );
        } else {
          const remainingAfter = total - (i + ALBUM_BATCH_SIZE);
          const progressAfter = Math.round(
            ((i + ALBUM_BATCH_SIZE) / total) * 100,
          );
          log(
            `batch ${currentBatch}/${totalBatches} completed (${remainingAfter} remaining, ${progressAfter}% complete)`,
            "enrich",
          );
        }
      }
    } catch (error) {
      const isUnauthorized =
        error instanceof SpotifyApiError && error.status === 401;
      const isUnauthorizedMessage =
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.includes("expired") ||
          error.message.includes("Unauthorized"));

      if (isUnauthorized || isUnauthorizedMessage) {
        log("access token expired, refreshing and retrying", "enrich");
        try {
          const { token: newToken } = await getAccessToken(userId);
          await rateLimiter.waitIfNeeded();
          const response = await spotifyFetch<AlbumsResponse>(
            "https://api.spotify.com/v1/albums",
            {
              token: newToken,
              query: { ids: albumIds.join(",") },
            },
          );

          const updates = response.albums
            .filter((a): a is AlbumResponse => a !== null && a.id !== undefined)
            .map((a) => ({
              id: a.id,
              image: a.images?.[0]?.url || "",
              popularity: a.popularity ?? 0,
            }));

          if (updates.length > 0) {
            // Batch fetch existing albums to avoid hitting D1 API request limit
            const updateIds = updates.map((u) => u.id);
            const existingAlbums = await db
              .select()
              .from(album)
              .where(inArray(album.id, updateIds));

            const existingMap = new Map(existingAlbums.map((a) => [a.id, a]));

            let batchEnriched = 0;
            for (const update of updates) {
              const existing = existingMap.get(update.id);

              if (!existing) continue;

              const updateData: {
                image?: string;
                popularity?: number;
              } = {};

              if (update.image && existing.image === "") {
                updateData.image = update.image;
              }
              if (existing.popularity === 0) {
                updateData.popularity = update.popularity;
              }

              if (Object.keys(updateData).length > 0) {
                await db
                  .update(album)
                  .set(updateData)
                  .where(eq(album.id, update.id));
                enriched++;
                batchEnriched++;
              }
            }
            if (batchEnriched > 0) {
              log(
                `enriched ${batchEnriched} albums in batch ${Math.floor(i / ALBUM_BATCH_SIZE) + 1} (${enriched} total)`,
                "enrich",
              );
            }
          }
          continue;
        } catch (retryError) {
          logError(
            `failed to retry after token refresh: ${serializeError(retryError)}`,
          );
        }
      }

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
        log(`rate limit hit, waiting ${retryAfter}ms before retry`, "enrich");
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
        await rateLimiter.waitIfNeeded();
        continue;
      }

      logError(`failed to enrich albums batch: ${serializeError(error)}`);
    }
  }

  log(
    `completed enriching albums: ${enriched}/${total} enriched (${total - enriched} skipped or failed)`,
    "enrich",
  );
}

export async function enrichArtistsAndAlbums() {
  log("starting artist and album enrichment", "enrich");

  try {
    const { token: accessToken, userId } = await getAccessToken();
    const rateLimiter = new RateLimiter();

    await enrichArtists(accessToken, userId, rateLimiter);
    await enrichAlbums(accessToken, userId, rateLimiter);

    log("completed artist and album enrichment", "enrich");
  } catch (error) {
    logError(`enrichment failed: ${serializeError(error)}`);
    throw error;
  }
}
