import { endOfYear, setYear, startOfYear } from "date-fns";
import { and, asc, count, desc, eq, gte, inArray, lte, max, min } from "drizzle-orm";
import {
  album,
  artist,
  likedTracks,
  playlist,
  playlistTrack,
  recentTracks,
  track,
  trackToArtist,
} from "~/lib.server/db/schema";
import type { Database } from "~/lib.server/services/db";

export type UserRecent = ReturnType<typeof getUserRecent>;
export async function getUserRecent(
  db: Database,
  args: {
    userId: string;
    provider: string;
  },
) {
  const { userId, provider } = args;

  // Get recent tracks with track information
  const recent = await db
    .select({
      id: recentTracks.id,
      playedAt: recentTracks.playedAt,
      trackId: recentTracks.trackId,
    })
    .from(recentTracks)
    .innerJoin(track, eq(track.id, recentTracks.trackId))
    .where(and(eq(recentTracks.userId, userId), eq(track.provider, provider)))
    .orderBy(desc(recentTracks.playedAt))
    .limit(10);

  // Get total count
  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(recentTracks)
    .innerJoin(track, eq(track.id, recentTracks.trackId))
    .where(and(eq(recentTracks.userId, userId), eq(track.provider, provider)));

  // Create map of trackId to playedAt
  const playedAtMap = new Map(recent.map((r) => [r.trackId, r.playedAt]));

  // Load tracks with relations (batch queries to respect SQLite param limit)
  // Using smaller batch size due to relation subqueries adding parameters
  const trackIds = recent.map((r) => r.trackId);
  const queryBatchSize = 50; // SQLite limit is ~999 vars, relations add params
  const tracks: Awaited<ReturnType<typeof db.query.track.findMany>> = [];

  for (let i = 0; i < trackIds.length; i += queryBatchSize) {
    const batch = trackIds.slice(i, i + queryBatchSize);
    const batchTracks = await db.query.track.findMany({
      where: inArray(track.id, batch),
      with: {
        album: true,
        artists: {
          with: {
            artist: true,
          },
        },
      },
    });
    tracks.push(...batchTracks);
  }

  // Preserve order and add playedAt
  const trackMap = new Map(tracks.map((t) => [t.id, t]));
  const orderedTracks = trackIds
    .map((id) => {
      const track = trackMap.get(id);
      if (!track) return null;
      return {
        ...track,
        playedAt: playedAtMap.get(id),
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  return { count: totalCount, tracks: orderedTracks };
}

export type UserLiked = ReturnType<typeof getUserLiked>;
export async function getUserLiked(
  db: Database,
  args: { userId: string; provider: string; year?: number },
) {
  const { userId, provider, year } = args;

  const whereConditions = [
    eq(likedTracks.userId, userId),
    eq(track.provider, provider),
  ];

  if (year !== undefined) {
    const date = setYear(new Date(), year);
    whereConditions.push(
      gte(likedTracks.createdAt, startOfYear(date).toISOString()),
      lte(likedTracks.createdAt, endOfYear(date).toISOString()),
    );
  }

  // Get liked tracks with track information
  const liked = await db
    .select({
      id: likedTracks.id,
      createdAt: likedTracks.createdAt,
      trackId: likedTracks.trackId,
    })
    .from(likedTracks)
    .innerJoin(track, eq(track.id, likedTracks.trackId))
    .where(and(...whereConditions))
    .orderBy(desc(likedTracks.createdAt))
    .limit(100);

  // Get total count
  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(likedTracks)
    .innerJoin(track, eq(track.id, likedTracks.trackId))
    .where(and(...whereConditions));

  // Create map of trackId to createdAt
  const createdAtMap = new Map(liked.map((l) => [l.trackId, l.createdAt]));

  // Load tracks with relations (batch queries to respect SQLite param limit)
  // Using smaller batch size due to relation subqueries adding parameters
  const trackIds = liked.map((l) => l.trackId);
  const queryBatchSize = 50; // SQLite limit is ~999 vars, relations add params
  const tracks: Awaited<ReturnType<typeof db.query.track.findMany>> = [];

  for (let i = 0; i < trackIds.length; i += queryBatchSize) {
    const batch = trackIds.slice(i, i + queryBatchSize);
    const batchTracks = await db.query.track.findMany({
      where: inArray(track.id, batch),
      with: {
        album: true,
        artists: {
          with: {
            artist: true,
          },
        },
      },
    });
    tracks.push(...batchTracks);
  }

  // Preserve order and add createdAt
  const trackMap = new Map(tracks.map((t) => [t.id, t]));
  const orderedTracks = trackIds
    .map((id) => {
      const track = trackMap.get(id);
      if (!track) return null;
      return {
        ...track,
        likedAt: createdAtMap.get(id),
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  return { count: totalCount, tracks: orderedTracks };
}

export type TopLeaderboard = Awaited<ReturnType<typeof getTopLeaderboard>>;
export async function getTopLeaderboard(db: Database) {
  const LAST_3_DAYS = new Date(Date.now() - 1000 * 60 * 60 * 24 * 3);
  const last3DaysStr = LAST_3_DAYS.toISOString();

  const trackIdsWithPlays = await db
    .select({
      trackId: recentTracks.trackId,
      plays: count(recentTracks.id),
    })
    .from(recentTracks)
    .where(gte(recentTracks.playedAt, last3DaysStr))
    .groupBy(recentTracks.trackId)
    .orderBy(desc(count(recentTracks.id)))
    .limit(20);

  // Load tracks with relations (batch queries to respect SQLite param limit)
  // Using smaller batch size due to relation subqueries adding parameters
  const trackIds = trackIdsWithPlays.map(({ trackId }) => trackId);
  const queryBatchSize = 50; // SQLite limit is ~999 vars, relations add params
  const tracks: Awaited<ReturnType<typeof db.query.track.findMany>> = [];

  for (let i = 0; i < trackIds.length; i += queryBatchSize) {
    const batch = trackIds.slice(i, i + queryBatchSize);
    const batchTracks = await db.query.track.findMany({
      where: inArray(track.id, batch),
      with: {
        album: true,
        artists: {
          with: {
            artist: true,
          },
        },
      },
    });
    tracks.push(...batchTracks);
  }

  // Create map for quick lookup
  const playsMap = new Map(
    trackIdsWithPlays.map(({ trackId, plays }) => [trackId, plays]),
  );

  // Map to return format with plays count
  return tracks.map((track) => ({
    ...track,
    plays: playsMap.get(track.id) || 0,
  }));
}

export async function getTrack(db: Database, trackId: string) {
  const trackResult = await db.query.track.findFirst({
    where: eq(track.id, trackId),
    with: {
      album: true,
      artists: {
        with: {
          artist: true,
        },
      },
    },
  });

  return trackResult;
}

export type UserPlaylists = ReturnType<typeof getUserPlaylists>;
export async function getUserPlaylists(
  db: Database,
  args: { userId: string; provider: string },
) {
  const { userId, provider } = args;

  // Get playlists with latest update time
  const playlistsWithUpdate = await db
    .select({
      playlist: playlist,
      latestUpdate: max(playlistTrack.addedAt),
    })
    .from(playlist)
    .leftJoin(playlistTrack, eq(playlistTrack.playlistId, playlist.id))
    .where(and(eq(playlist.userId, userId), eq(playlist.provider, provider)))
    .groupBy(playlist.id)
    .orderBy(desc(max(playlistTrack.addedAt)), asc(playlist.name));

  // Extract just the playlists (latestUpdate was only for sorting)
  const playlists = playlistsWithUpdate.map(({ playlist }) => playlist);

  // Get total count
  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(playlist)
    .where(and(eq(playlist.userId, userId), eq(playlist.provider, provider)));

  return { count: totalCount, playlists };
}

export type PlaylistWithTracks = Awaited<
  ReturnType<typeof getPlaylistWithTracks>
>;
export async function getPlaylistWithTracks(
  db: Database,
  args: { playlistId: string; userId: string },
) {
  const { playlistId, userId } = args;

  // Get playlist (with userId check for security)
  const playlistData = await db.query.playlist.findFirst({
    where: and(eq(playlist.id, playlistId), eq(playlist.userId, userId)),
  });

  if (!playlistData) return null;

  const playlistTracks = await db
    .select({
      trackId: playlistTrack.trackId,
      addedAt: playlistTrack.addedAt,
    })
    .from(playlistTrack)
    .where(eq(playlistTrack.playlistId, playlistId))
    .orderBy(asc(playlistTrack.addedAt));

  // Load tracks with relations (batch queries to respect SQLite param limit)
  // Using smaller batch size due to relation subqueries adding parameters
  const trackIds = playlistTracks.map((pt) => pt.trackId);
  const queryBatchSize = 50; // SQLite limit is ~999 vars, relations add params
  const tracks: Awaited<ReturnType<typeof db.query.track.findMany>> = [];

  for (let i = 0; i < trackIds.length; i += queryBatchSize) {
    const batch = trackIds.slice(i, i + queryBatchSize);
    const batchTracks = await db.query.track.findMany({
      where: inArray(track.id, batch),
      with: {
        album: true,
        artists: {
          with: {
            artist: true,
          },
        },
      },
    });
    tracks.push(...batchTracks);
  }

  // Preserve order from playlistTracks
  const trackMap = new Map(tracks.map((t) => [t.id, t]));
  const orderedTracks = trackIds
    .map((id) => trackMap.get(id))
    .filter((t): t is NonNullable<(typeof tracks)[0]> => t !== undefined);

  const [{ createdAt }] = await db
    .select({ createdAt: min(playlistTrack.addedAt) })
    .from(playlistTrack)
    .where(eq(playlistTrack.playlistId, playlistId));

  return {
    playlist: playlistData,
    tracks: orderedTracks,
    createdAt: createdAt || null,
  };
}

export async function getPlaybacks(db: Database) {
  const playbacks = await db
    .select({
      track: track,
    })
    .from(track)
    .innerJoin(recentTracks, eq(track.id, recentTracks.trackId))
    .groupBy(track.id)
    .orderBy(desc(count(recentTracks.id)));

  return playbacks;
}
