import { endOfYear, setYear, startOfYear } from "date-fns";
import { and, count, desc, eq, gte, lte, max, min } from "drizzle-orm";
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
} from "~/lib/db/schema";
import { getAllUsersId } from "~/lib/services/db/users.server";
import { db } from "~/lib/services/db.server";
import { log, logError } from "~/lib/utils";

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

  return Array.from(years).sort();
}

export async function syncUserStats({
  userId,
  year,
}: {
  userId: string;
  year: number;
}) {
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

  let played = 0;
  let minutes = 0;
  const artists: Record<string, number> = {};
  const albums: Record<string, number> = {};
  const songs: Record<string, number> = {};

  const take = 2500;
  let skip = 0;
  let all = false;

  while (!all) {
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

  const now = new Date().toISOString();
  const statsId = `${userId}-${year}`;

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
      createdAt: now,
      updatedAt: now,
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
        updatedAt: now,
      },
    });

  log(`synced stats for ${userId} year ${year}`, "stats");
}

export async function syncAllUsersStats() {
  log("starting stats sync", "stats");

  try {
    const activeUsers = await getAllUsersId();

    log(`syncing stats for ${activeUsers.length} users`, "stats");

    const BATCH_SIZE = 3;
    for (let i = 0; i < activeUsers.length; i += BATCH_SIZE) {
      const batch = activeUsers.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(async (userId) => {
          try {
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
              if (now - updatedAt < SYNC_COOLDOWN_MS) {
                log(`skipped - recent sync exists for ${userId}`, "stats");
                return;
              }
            }

            const years = await getUserYearsWithData(userId);

            if (years.length === 0) {
              log(`no data found for ${userId}`, "stats");
              return;
            }

            for (const year of years) {
              await syncUserStats({ userId, year });
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
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    log("completed stats sync", "stats");
  } catch (error) {
    logError(`stats sync failed: ${error}`);
  }
}
