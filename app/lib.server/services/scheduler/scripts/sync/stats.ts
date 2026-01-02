import { endOfYear, setYear, startOfYear } from "date-fns";
import { and, count, desc, eq, gte, lte, max, min } from "drizzle-orm";
import { log, logError } from "~/components/utils";
import {
  album,
  artist,
  likedTracks,
  provider,
  recentTracks,
  stats,
  sync,
  track,
  trackToArtist,
  user,
} from "~/lib.server/db/schema";
import { db } from "~/lib.server/services/db";
import { getAllUsersId } from "~/lib.server/services/db/users";
import { generateId } from "~/lib.server/services/utils";

const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

function calculateStats(
  rows: {
    track: {
      name: string;
      duration: number;
    };
    artistName: string | null;
    albumNameRel: string | null;
  }[],
) {
  const minutes = rows.reduce(
    (acc, curr) => acc + curr.track.duration / 60_000,
    0,
  );

  const artists = rows.reduce(
    (acc, { artistName }) => {
      if (artistName) {
        acc[artistName] = (acc[artistName] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const albums = rows.reduce(
    (acc, { albumNameRel }) => {
      if (albumNameRel) {
        acc[albumNameRel] = (acc[albumNameRel] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const songs = rows.reduce(
    (acc, { track }) => {
      acc[track.name] = (acc[track.name] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return { minutes, artists, albums, songs, played: rows.length };
}

function getTopItems(arg: {
  artists: Record<string, number>;
  albums: Record<string, number>;
  songs: Record<string, number>;
}) {
  const artist = Object.entries(arg.artists).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0],
  )[0];

  const album = Object.entries(arg.albums).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0],
  )[0];

  const song = Object.entries(arg.songs).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0],
  )[0];

  return { artist, album, song };
}

async function getUserYearsWithData(userId: string): Promise<number[]> {
  log(`fetching years with data for user ${userId}`, "stats");
  const years = new Set<number>();

  const recentDates = await db
    .select({
      minDate: min(recentTracks.playedAt),
      maxDate: max(recentTracks.playedAt),
    })
    .from(recentTracks)
    .where(eq(recentTracks.userId, userId));

  const likedDates = await db
    .select({
      minDate: min(likedTracks.createdAt),
      maxDate: max(likedTracks.createdAt),
    })
    .from(likedTracks)
    .where(eq(likedTracks.userId, userId));

  const addYearsFromDateRange = (
    minDate: string | number | null,
    maxDate: string | number | null,
  ) => {
    if (!minDate || !maxDate) return;

    const min = new Date(minDate);
    const max = new Date(maxDate);

    const minYear = min.getFullYear();
    const maxYear = max.getFullYear();

    for (let year = minYear; year <= maxYear; year++) {
      years.add(year);
    }
  };

  if (recentDates[0]) {
    addYearsFromDateRange(recentDates[0].minDate, recentDates[0].maxDate);
  }

  if (likedDates[0]) {
    addYearsFromDateRange(likedDates[0].minDate, likedDates[0].maxDate);
  }

  const sortedYears = Array.from(years).sort();
  log(
    `found ${sortedYears.length} years with data for user ${userId}: ${sortedYears.join(", ")}`,
    "stats",
  );
  return sortedYears;
}

async function getUserYearsWithStats(userId: string): Promise<Set<number>> {
  const existingStats = await db.query.stats.findMany({
    where: eq(stats.userId, userId),
    columns: { year: true },
  });
  return new Set(existingStats.map((s) => s.year));
}

export async function syncUserStatsAll({ userId }: { userId: string }) {
  log(`starting all-time stats sync for user ${userId}`, "stats");
  const now = new Date().toISOString();

  // Mark sync as pending
  await db
    .insert(sync)
    .values({
      userId,
      state: "pending",
      type: "stats",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [sync.userId, sync.state, sync.type],
      set: { state: "pending", updatedAt: now },
    });

  try {
    const [{ count: liked }] = await db
      .select({ count: count() })
      .from(likedTracks)
      .where(eq(likedTracks.userId, userId));

    log(`found ${liked} total liked tracks for user ${userId}`, "stats");

    let played = 0;
    let minutes = 0;
    const artists: Record<string, number> = {};
    const albums: Record<string, number> = {};
    const songs: Record<string, number> = {};

    const take = 2500;
    let skip = 0;
    let all = false;
    let batchNumber = 0;

    while (!all) {
      batchNumber++;
      const rows = await db
        .select({
          track: {
            uri: track.uri,
            name: track.name,
            duration: track.duration,
          },
          artistName: artist.name,
          albumNameRel: album.name,
        })
        .from(recentTracks)
        .innerJoin(track, eq(recentTracks.trackId, track.id))
        .leftJoin(trackToArtist, eq(track.id, trackToArtist.trackId))
        .leftJoin(artist, eq(trackToArtist.artistId, artist.id))
        .leftJoin(album, eq(track.albumId, album.id))
        .where(eq(recentTracks.userId, userId))
        .orderBy(desc(recentTracks.playedAt))
        .limit(take)
        .offset(skip);

      log(
        `processing batch ${batchNumber} for user ${userId} (all-time): ${rows.length} tracks (skip: ${skip})`,
        "stats",
      );

      if (rows.length < take) {
        all = true;
      }

      skip += rows.length;
      const batch = calculateStats(rows);
      played += batch.played;
      minutes += batch.minutes;

      for (const [artist, count] of Object.entries(batch.artists)) {
        artists[artist] = (artists[artist] ?? 0) + count;
      }
      for (const [album, count] of Object.entries(batch.albums)) {
        albums[album] = (albums[album] ?? 0) + count;
      }
      for (const [song, count] of Object.entries(batch.songs)) {
        songs[song] = (songs[song] ?? 0) + count;
      }
    }

    const topItems = getTopItems({ songs, albums, artists });

    log(
      `calculated all-time stats for user ${userId}: ${played} plays, ${Math.round(minutes)} minutes, top song: ${topItems.song || "none"}, top artist: ${topItems.artist || "none"}, top album: ${topItems.album || "none"}`,
      "stats",
    );

    const statsId = generateId();
    const updatedAt = new Date().toISOString();
    const year = 0;

    // Always save stats record, even if all values are 0 or undefined
    // This ensures we have a record indicating the sync completed
    await db
      .insert(stats)
      .values({
        id: statsId,
        userId,
        year,
        played,
        liked,
        minutes: minutes.toString(),
        song: topItems.song || null,
        artist: topItems.artist || null,
        album: topItems.album || null,
        createdAt: updatedAt,
        updatedAt: updatedAt,
      })
      .onConflictDoUpdate({
        target: [stats.userId, stats.year],
        set: {
          played,
          liked,
          minutes: minutes.toString(),
          song: topItems.song || null,
          artist: topItems.artist || null,
          album: topItems.album || null,
          updatedAt: updatedAt,
        },
      });

    log(`saved all-time stats to database for user ${userId}`, "stats");

    // Mark sync as success
    await db
      .insert(sync)
      .values({
        userId,
        state: "success",
        type: "stats",
        createdAt: updatedAt,
        updatedAt: updatedAt,
      })
      .onConflictDoUpdate({
        target: [sync.userId, sync.state, sync.type],
        set: { state: "success", updatedAt: updatedAt },
      });

    log(`successfully synced all-time stats for user ${userId}`, "stats");
  } catch (error) {
    logError(`failed to sync all-time stats for user ${userId}: ${error}`);
    // Mark sync as error
    const errorAt = new Date().toISOString();
    await db
      .insert(sync)
      .values({
        userId,
        state: "error",
        type: "stats",
        createdAt: errorAt,
        updatedAt: errorAt,
      })
      .onConflictDoUpdate({
        target: [sync.userId, sync.state, sync.type],
        set: { state: "error", updatedAt: errorAt },
      });
    throw error;
  }
}

export async function syncUserStats({
  userId,
  year,
}: {
  userId: string;
  year: number;
}) {
  log(`starting stats sync for user ${userId}, year ${year}`, "stats");
  const now = new Date().toISOString();

  // Mark sync as pending
  await db
    .insert(sync)
    .values({
      userId,
      state: "pending",
      type: "stats",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [sync.userId, sync.state, sync.type],
      set: { state: "pending", updatedAt: now },
    });

  try {
    const date = setYear(new Date(), year);

    const [{ count: liked }] = await db
      .select({ count: count() })
      .from(likedTracks)
      .where(
        and(
          eq(likedTracks.userId, userId),
          gte(likedTracks.createdAt, startOfYear(date).toISOString()),
          lte(likedTracks.createdAt, endOfYear(date).toISOString()),
        ),
      );

    log(
      `found ${liked} liked tracks for user ${userId}, year ${year}`,
      "stats",
    );

    let played = 0;
    let minutes = 0;
    const artists: Record<string, number> = {};
    const albums: Record<string, number> = {};
    const songs: Record<string, number> = {};

    const take = 2500;
    let skip = 0;
    let all = false;
    let batchNumber = 0;

    while (!all) {
      batchNumber++;
      const rows = await db
        .select({
          track: {
            uri: track.uri,
            name: track.name,
            duration: track.duration,
          },
          artistName: artist.name,
          albumNameRel: album.name,
        })
        .from(recentTracks)
        .innerJoin(track, eq(recentTracks.trackId, track.id))
        .leftJoin(trackToArtist, eq(track.id, trackToArtist.trackId))
        .leftJoin(artist, eq(trackToArtist.artistId, artist.id))
        .leftJoin(album, eq(track.albumId, album.id))
        .where(
          and(
            eq(recentTracks.userId, userId),
            gte(recentTracks.playedAt, startOfYear(date).toISOString()),
            lte(recentTracks.playedAt, endOfYear(date).toISOString()),
          ),
        )
        .orderBy(desc(recentTracks.playedAt))
        .limit(take)
        .offset(skip);

      log(
        `processing batch ${batchNumber} for user ${userId}, year ${year}: ${rows.length} tracks (skip: ${skip})`,
        "stats",
      );

      if (rows.length < take) {
        all = true;
      }

      skip += rows.length;
      const batch = calculateStats(rows);
      played += batch.played;
      minutes += batch.minutes;

      for (const [artist, count] of Object.entries(batch.artists)) {
        artists[artist] = (artists[artist] ?? 0) + count;
      }
      for (const [album, count] of Object.entries(batch.albums)) {
        albums[album] = (albums[album] ?? 0) + count;
      }
      for (const [song, count] of Object.entries(batch.songs)) {
        songs[song] = (songs[song] ?? 0) + count;
      }
    }

    const topItems = getTopItems({ songs, albums, artists });

    log(
      `calculated stats for user ${userId}, year ${year}: ${played} plays, ${Math.round(minutes)} minutes, top song: ${topItems.song || "none"}, top artist: ${topItems.artist || "none"}, top album: ${topItems.album || "none"}`,
      "stats",
    );

    const statsId = generateId();
    const updatedAt = new Date().toISOString();

    // Always save stats record, even if all values are 0 or undefined
    // This ensures we have a record indicating the sync completed
    await db
      .insert(stats)
      .values({
        id: statsId,
        userId,
        year,
        played,
        liked,
        minutes: minutes.toString(),
        song: topItems.song || null,
        artist: topItems.artist || null,
        album: topItems.album || null,
        createdAt: updatedAt,
        updatedAt: updatedAt,
      })
      .onConflictDoUpdate({
        target: [stats.userId, stats.year],
        set: {
          played,
          liked,
          minutes: minutes.toString(),
          song: topItems.song || null,
          artist: topItems.artist || null,
          album: topItems.album || null,
          updatedAt: updatedAt,
        },
      });

    log(`saved stats to database for user ${userId}, year ${year}`, "stats");

    // Mark sync as success
    await db
      .insert(sync)
      .values({
        userId,
        state: "success",
        type: "stats",
        createdAt: updatedAt,
        updatedAt: updatedAt,
      })
      .onConflictDoUpdate({
        target: [sync.userId, sync.state, sync.type],
        set: { state: "success", updatedAt: updatedAt },
      });

    log(`successfully synced stats for user ${userId}, year ${year}`, "stats");
  } catch (error) {
    logError(`failed to sync stats for user ${userId}, year ${year}: ${error}`);
    // Mark sync as error
    const errorAt = new Date().toISOString();
    await db
      .insert(sync)
      .values({
        userId,
        state: "error",
        type: "stats",
        createdAt: errorAt,
        updatedAt: errorAt,
      })
      .onConflictDoUpdate({
        target: [sync.userId, sync.state, sync.type],
        set: { state: "error", updatedAt: errorAt },
      });
    throw error;
  }
}

export async function syncAllUsersStats() {
  log("starting stats sync", "stats");

  try {
    const activeUsers = await getAllUsersId();

    log(`syncing stats for ${activeUsers.length} users`, "stats");

    const BATCH_SIZE = 3;
    const totalBatches = Math.ceil(activeUsers.length / BATCH_SIZE);
    for (let i = 0; i < activeUsers.length; i += BATCH_SIZE) {
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const batch = activeUsers.slice(i, i + BATCH_SIZE);

      log(
        `processing batch ${batchNumber}/${totalBatches} (${batch.length} users)`,
        "stats",
      );

      await Promise.allSettled(
        batch.map(async (userId) => {
          try {
            log(`checking sync status for user ${userId}`, "stats");
            const recentSync = await db.query.sync.findFirst({
              where: and(
                eq(sync.userId, userId),
                eq(sync.type, "stats"),
                eq(sync.state, "success"),
              ),
              orderBy: desc(sync.updatedAt),
            });

            if (recentSync) {
              const updatedAt = new Date(recentSync.updatedAt).getTime();
              const now = Date.now();
              const timeSinceSync = now - updatedAt;
              if (timeSinceSync < SYNC_COOLDOWN_MS) {
                const remainingCooldown = Math.ceil(
                  (SYNC_COOLDOWN_MS - timeSinceSync) / 1000 / 60,
                );
                log(
                  `skipped user ${userId} - recent sync exists (${remainingCooldown} minutes remaining in cooldown)`,
                  "stats",
                );
                return;
              }
            }

            const years = await getUserYearsWithData(userId);

            if (years.length === 0) {
              log(`no data found for user ${userId}`, "stats");
              return;
            }

            const existingStatsYears = await getUserYearsWithStats(userId);
            const currentYear = new Date().getFullYear();
            const pastYears = years.filter((year) => year < currentYear);
            const missingPastYears = pastYears.filter(
              (year) => !existingStatsYears.has(year),
            );

            // Only sync if there are missing past years, or if all past years exist and we need to sync current year
            if (missingPastYears.length > 0) {
              log(
                `syncing ${missingPastYears.length} missing past years for user ${userId}: ${missingPastYears.join(", ")}`,
                "stats",
              );
              for (const year of missingPastYears) {
                await syncUserStats({ userId, year });
              }
            }

            // Sync current year only if all past years exist
            if (
              pastYears.length > 0 &&
              missingPastYears.length === 0 &&
              years.includes(currentYear) &&
              !existingStatsYears.has(currentYear)
            ) {
              log(
                `all past years exist for user ${userId}, syncing current year ${currentYear}`,
                "stats",
              );
              await syncUserStats({ userId, year: currentYear });
            } else if (
              pastYears.length === 0 &&
              years.includes(currentYear) &&
              !existingStatsYears.has(currentYear)
            ) {
              // If user only has current year data, sync it
              log(
                `syncing current year ${currentYear} for user ${userId}`,
                "stats",
              );
              await syncUserStats({ userId, year: currentYear });
            } else if (missingPastYears.length === 0) {
              log(`all years already synced for user ${userId}`, "stats");
            }

            const now = new Date().toISOString();
            await db
              .insert(sync)
              .values({
                userId,
                state: "success",
                type: "stats",
                createdAt: now,
                updatedAt: now,
              })
              .onConflictDoUpdate({
                target: [sync.userId, sync.state, sync.type],
                set: { state: "success", updatedAt: now },
              });

            log(`completed stats sync for ${userId}`, "stats");
          } catch (error) {
            logError(`stats sync failed for ${userId}: ${error}`);
            const now = new Date().toISOString();
            await db
              .insert(sync)
              .values({
                userId,
                state: "failure",
                type: "stats",
                createdAt: now,
                updatedAt: now,
              })
              .onConflictDoUpdate({
                target: [sync.userId, sync.state, sync.type],
                set: { state: "failure", updatedAt: now },
              });
          }
        }),
      );

      if (i + BATCH_SIZE < activeUsers.length) {
        log(`waiting 2 seconds before next batch...`, "stats");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    log(`completed stats sync for all ${activeUsers.length} users`, "stats");
  } catch (error) {
    logError(`stats sync failed: ${error}`);
    throw error;
  }
}
