import { and, asc, count, desc, eq, gte, inArray, min } from "drizzle-orm";
import {
  likedTracks,
  playlist,
  playlistTrack,
  recentTracks,
  track,
} from "~/lib/db/schema";
import type { Database } from "~/lib/services/db.server";

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
      track: track,
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

  return { count: totalCount, tracks: recent.map((r) => r.track) };
}

export type UserLiked = ReturnType<typeof getUserLiked>;
export async function getUserLiked(
  db: Database,
  args: { userId: string; provider: string },
) {
  const { userId, provider } = args;

  // Get liked tracks with track information
  const liked = await db
    .select({
      id: likedTracks.id,
      createdAt: likedTracks.createdAt,
      track: track,
    })
    .from(likedTracks)
    .innerJoin(track, eq(track.id, likedTracks.trackId))
    .where(and(eq(likedTracks.userId, userId), eq(track.provider, provider)))
    .orderBy(desc(likedTracks.createdAt))
    .limit(10);

  // Get total count
  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(likedTracks)
    .innerJoin(track, eq(track.id, likedTracks.trackId))
    .where(and(eq(likedTracks.userId, userId), eq(track.provider, provider)));

  return { count: totalCount, tracks: liked.map((l) => l.track) };
}

export type TopLeaderboard = Awaited<ReturnType<typeof getTopLeaderboard>>;
export async function getTopLeaderboard(db: Database) {
  const LAST_3_DAYS = new Date(Date.now() - 1000 * 60 * 60 * 24 * 3);
  const last3DaysStr = LAST_3_DAYS.toISOString();

  const trackIds = await db
    .select({
      trackId: recentTracks.trackId,
      count: count(recentTracks.id),
    })
    .from(recentTracks)
    .where(gte(recentTracks.playedAt, last3DaysStr))
    .groupBy(recentTracks.trackId)
    .orderBy(desc(count(recentTracks.id)))
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
      plays: count(recentTracks.id),
    })
    .from(track)
    .innerJoin(recentTracks, eq(track.id, recentTracks.trackId))
    .where(
      and(
        inArray(track.id, trackIdsArray),
        gte(recentTracks.playedAt, last3DaysStr),
      ),
    )
    .groupBy(track.id)
    .orderBy(desc(count(recentTracks.id)));

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
    .orderBy(playlist.name);

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

  const tracks = await db
    .select({
      track: track,
    })
    .from(playlistTrack)
    .innerJoin(track, eq(playlistTrack.trackId, track.id))
    .where(eq(playlistTrack.playlistId, playlistId))
    .orderBy(asc(playlistTrack.addedAt));

  const [{ createdAt }] = await db
    .select({ createdAt: min(playlistTrack.addedAt) })
    .from(playlistTrack)
    .where(eq(playlistTrack.playlistId, playlistId));

  return {
    playlist: playlistData,
    tracks: tracks.map((t) => t.track),
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
