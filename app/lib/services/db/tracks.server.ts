import { and, count, desc, eq, gte, inArray } from "drizzle-orm";
import {
  feed,
  likedSongs,
  playlist,
  recentSongs,
  recommended,
  track,
} from "~/lib/db/schema";
import type { Database } from "~/lib/services/db.server";

export async function getFeed(
  db: Database,
  args?: { limit?: number; offset?: number },
) {
  const { limit = 20, offset = 0 } = args ?? {};

  // TODO: Implement complex feed query with proper relations
  // For now, return basic feed entries
  const feedEntries = await db.query.feed.findMany({
    orderBy: desc(feed.createdAt),
    offset: offset * limit,
    limit,
  });

  return feedEntries;
}

export async function getUserRecommended(db: Database, userId: string) {
  const userRecommended = await db.query.recommended.findMany({
    with: {
      track: true,
    },
    orderBy: desc(recommended.createdAt),
    where: eq(recommended.userId, userId),
  });

  return userRecommended.map((t) => t.track);
}

export type UserRecent = ReturnType<typeof getUserRecent>;
export async function getUserRecent(
  db: Database,
  args: {
    userId: string;
    provider: string;
  },
) {
  const { userId, provider } = args;

  // Get recent songs with track information
  const recent = await db
    .select({
      id: recentSongs.id,
      playedAt: recentSongs.playedAt,
      track: track,
    })
    .from(recentSongs)
    .innerJoin(track, eq(track.id, recentSongs.trackId))
    .where(and(eq(recentSongs.userId, userId), eq(track.provider, provider)))
    .orderBy(desc(recentSongs.playedAt))
    .limit(10);

  // Get total count
  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(recentSongs)
    .innerJoin(track, eq(track.id, recentSongs.trackId))
    .where(and(eq(recentSongs.userId, userId), eq(track.provider, provider)));

  return { count: totalCount, tracks: recent.map((r) => r.track) };
}

export type UserLiked = ReturnType<typeof getUserLiked>;
export async function getUserLiked(
  db: Database,
  args: { userId: string; provider: string },
) {
  const { userId, provider } = args;

  // Get liked songs with track information
  const liked = await db
    .select({
      id: likedSongs.id,
      createdAt: likedSongs.createdAt,
      track: track,
    })
    .from(likedSongs)
    .innerJoin(track, eq(track.id, likedSongs.trackId))
    .where(and(eq(likedSongs.userId, userId), eq(track.provider, provider)))
    .orderBy(desc(likedSongs.createdAt))
    .limit(10);

  // Get total count
  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(likedSongs)
    .innerJoin(track, eq(track.id, likedSongs.trackId))
    .where(and(eq(likedSongs.userId, userId), eq(track.provider, provider)));

  return { count: totalCount, tracks: liked.map((l) => l.track) };
}

export type TopLeaderboard = Awaited<ReturnType<typeof getTopLeaderboard>>;
export async function getTopLeaderboard(db: Database) {
  const LAST_3_DAYS = new Date(Date.now() - 1000 * 60 * 60 * 24 * 3);
  const last3DaysStr = LAST_3_DAYS.toISOString();

  const trackIds = await db
    .select({
      trackId: recentSongs.trackId,
      count: count(recentSongs.id),
    })
    .from(recentSongs)
    .where(gte(recentSongs.playedAt, last3DaysStr))
    .groupBy(recentSongs.trackId)
    .orderBy(desc(count(recentSongs.id)))
    .limit(20);

  const trackIdsArray = trackIds.map((t) => t.trackId);

  const top = await db
    .select({
      id: track.id,
      name: track.name,
      artist: track.artist,
      image: track.image,
      uri: track.uri,
      provider: track.provider,
      albumName: track.albumName,
      albumUri: track.albumUri,
      artistUri: track.artistUri,
      explicit: track.explicit,
      duration: track.duration,
      previewUrl: track.previewUrl,
      link: track.link,
      plays: count(recentSongs.id),
    })
    .from(track)
    .innerJoin(recentSongs, eq(track.id, recentSongs.trackId))
    .where(
      and(
        inArray(track.id, trackIdsArray),
        gte(recentSongs.playedAt, last3DaysStr),
      ),
    )
    .groupBy(track.id)
    .orderBy(desc(count(recentSongs.id)));

  return top;
}

export async function getTrack(db: Database, trackId: string) {
  const trackResult = await db.query.track.findFirst({
    where: eq(track.id, trackId),
  });

  return trackResult;
}

export type UserPlaylists = ReturnType<typeof getUserPlaylists>;
export async function getUserPlaylists(
  db: Database,
  args: { userId: string; provider: string },
) {
  const { userId, provider } = args;

  // Get playlists for user
  const playlists = await db
    .select()
    .from(playlist)
    .where(and(eq(playlist.userId, userId), eq(playlist.provider, provider)))
    .orderBy(playlist.name)
    .limit(10);

  // Get total count
  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(playlist)
    .where(and(eq(playlist.userId, userId), eq(playlist.provider, provider)));

  return { count: totalCount, playlists };
}

export async function getPlaybacks(db: Database) {
  const playbacks = await db
    .select({
      track: track,
    })
    .from(track)
    .innerJoin(recentSongs, eq(track.id, recentSongs.trackId))
    .groupBy(track.id)
    .orderBy(desc(count(recentSongs.id)));

  return playbacks;
}
