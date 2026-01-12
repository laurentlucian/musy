import { eq, inArray, or } from "drizzle-orm";
import { log, logError } from "~/components/utils";
import { artist } from "~/lib.server/db/schema";
import { SpotifyApiError } from "~/lib.server/sdk/spotify";
import { spotifyFetch } from "~/lib.server/sdk/spotify/fetch";
import type { Artist, Artists } from "~/lib.server/sdk/spotify/types";
import { db } from "~/lib.server/services/db";
import { getAccessToken, RateLimiter, serializeError } from "./enrich-utils";

export async function enrichArtists() {
  log("starting artist enrichment", "enrich");

  try {
    const { token: accessToken, userId } = await getAccessToken();
    const rateLimiter = new RateLimiter();

    const artistsToEnrich = await db
      .select({ id: artist.id })
      .from(artist)
      .where(eq(artist.enriched, false))
      .limit(700);

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
            followers: a.followers?.total ?? 0,
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
              followers?: number;
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
            if (update.followers > 0 && existing.followers === 0) {
              updateData.followers = update.followers;
            }

            if (Object.keys(updateData).length > 0) {
              await db
                .update(artist)
                .set({ ...updateData, enriched: true })
                .where(eq(artist.id, update.id));
              enriched++;
              batchEnriched++;
            } else {
              await db
                .update(artist)
                .set({ enriched: true })
                .where(eq(artist.id, update.id));
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
                followers: a.followers?.total ?? 0,
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
                  followers?: number;
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
                if (update.followers > 0 && existing.followers === 0) {
                  updateData.followers = update.followers;
                }

                if (Object.keys(updateData).length > 0) {
                  await db
                    .update(artist)
                    .set({ ...updateData, enriched: true })
                    .where(eq(artist.id, update.id));
                  enriched++;
                  batchEnriched++;
                } else {
                  await db
                    .update(artist)
                    .set({ enriched: true })
                    .where(eq(artist.id, update.id));
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
  } catch (error) {
    logError(`artist enrichment failed: ${serializeError(error)}`);
    throw error;
  }
}
