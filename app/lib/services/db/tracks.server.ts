import { and, count, desc, eq, gte, inArray, min } from "drizzle-orm";
import {
  likedSongs,
  playlist,
  playlistTrack,
  recentSongs,
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

  // Get tracks for this playlist using join (same pattern as getUserRecent)
  const playlistTracks = await db
    .select({
      trackId: playlistTrack.trackId,
      track: track,
      addedAt: playlistTrack.addedAt,
    })
    .from(playlistTrack)
    .leftJoin(track, eq(playlistTrack.trackId, track.id))
    .where(eq(playlistTrack.playlistId, playlistId))
    .orderBy(playlistTrack.addedAt);

  // Get earliest addedAt as creation date approximation
  const [{ createdAt }] = await db
    .select({ createdAt: min(playlistTrack.addedAt) })
    .from(playlistTrack)
    .where(eq(playlistTrack.playlistId, playlistId));

  console.log("playlistTracks", playlistTracks);
  return {
    playlist: playlistData,
    tracks: playlistTracks.filter((pt) => pt.track).map((pt) => pt.track),
    createdAt: createdAt || null,
  };
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
