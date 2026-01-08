import { eq, inArray, or } from "drizzle-orm";
import { log, logError } from "~/components/utils";
import { album } from "~/lib.server/db/schema";
import { SpotifyApiError } from "~/lib.server/sdk/spotify";
import { spotifyFetch } from "~/lib.server/sdk/spotify/fetch";
import { db } from "~/lib.server/services/db";
import { getAccessToken, RateLimiter, serializeError } from "./enrich-utils";

interface AlbumResponse {
  id: string;
  name: string;
  images: Array<{ url: string; height: number | null; width: number | null }>;
  popularity: number;
  release_date?: string;
  total_tracks?: number;
}

interface AlbumsResponse {
  albums: AlbumResponse[];
}

export async function enrichAlbums() {
  log("starting album enrichment", "enrich");

  try {
    const { token: accessToken, userId } = await getAccessToken();
    const rateLimiter = new RateLimiter();

    const albumsToEnrich = await db
      .select({ id: album.id })
      .from(album)
      .where(
        or(
          eq(album.image, ""),
          eq(album.popularity, 0),
          eq(album.date, ""),
          eq(album.total, ""),
        ),
      )
      .limit(700);

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
            date: a.release_date || "",
            total: String(a.total_tracks || 0),
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
              date?: string;
              total?: string;
            } = {};

            if (update.image && existing.image === "") {
              updateData.image = update.image;
            }
            if (existing.popularity === 0) {
              updateData.popularity = update.popularity;
            }
            if (update.date && existing.date === "") {
              updateData.date = update.date;
            }
            if (update.total && existing.total === "") {
              updateData.total = update.total;
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
                date: a.release_date || "",
                total: String(a.total_tracks || 0),
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
                  date?: string;
                  total?: string;
                } = {};

                if (update.image && existing.image === "") {
                  updateData.image = update.image;
                }
                if (existing.popularity === 0) {
                  updateData.popularity = update.popularity;
                }
                if (update.date && existing.date === "") {
                  updateData.date = update.date;
                }
                if (update.total && existing.total === "") {
                  updateData.total = update.total;
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
  } catch (error) {
    logError(`album enrichment failed: ${serializeError(error)}`);
    throw error;
  }
}
