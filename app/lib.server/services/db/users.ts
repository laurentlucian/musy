import { and, desc, eq, inArray } from "drizzle-orm";
import {
  album,
  artist,
  likedTracks,
  playback,
  playbackHistory,
  playlist,
  playlistTrack,
  profile,
  provider,
  recentTracks,
  stats,
  sync,
  top,
  topArtists,
  topTracks,
  track,
  trackToArtist,
  user,
} from "~/lib.server/db/schema";
import { db } from "~/lib.server/services/db";
import { syncUserStats } from "~/lib.server/services/scheduler/scripts/sync/stats";

export async function getProvider(args: {
  userId: string;
  type: "spotify" | "google";
}) {
  try {
    const data = await db.query.provider.findFirst({
      where: and(
        eq(provider.userId, args.userId),
        eq(provider.type, args.type),
      ),
    });
    return data;
  } catch (error) {
    // Log more details about the error for debugging
    console.error("getProvider error:", {
      userId: args.userId,
      type: args.type,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
              cause: error.cause,
            }
          : error,
    });
    throw error;
  }
}

export type Providers = ReturnType<typeof getProviders>;
export async function getProviders(userId: string) {
  return db
    .select({ type: provider.type })
    .from(provider)
    .where(eq(provider.userId, userId));
}

export async function updateToken(args: {
  id: string;
  token: string;
  expiresAt: number;
  refreshToken?: string;
  type: "spotify" | "google";
}) {
  const { id, token, expiresAt, refreshToken, type } = args;
  await db
    .update(provider)
    .set({
      accessToken: token,
      expiresAt,
      refreshToken,
      revoked: "0",
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(provider.userId, id), eq(provider.type, type)));
  return expiresAt;
}

export async function getAllUsersId() {
  const users = await db
    .select({ id: user.id })
    .from(user)
    .innerJoin(provider, eq(user.id, provider.userId))
    .where(eq(provider.revoked, "0"));
  return users.map((u) => u.id);
}

export async function revokeUser(
  userId: string,
  providerType: "spotify" | "google",
) {
  await db
    .update(provider)
    .set({ revoked: "1", updatedAt: new Date().toISOString() })
    .where(and(eq(provider.userId, userId), eq(provider.type, providerType)));
}

export async function deleteUser(userId: string) {
  // Delete playlist tracks first (foreign key constraint)
  const userPlaylists = await db
    .select({ id: playlist.id })
    .from(playlist)
    .where(eq(playlist.userId, userId));
  const playlistIds = userPlaylists.map((p) => p.id);

  // Batch delete playlist tracks to avoid SQLite variable limit (D1 max is 100 params)
  const batchSize = 100;
  for (let i = 0; i < playlistIds.length; i += batchSize) {
    const batch = playlistIds.slice(i, i + batchSize);
    await db
      .delete(playlistTrack)
      .where(inArray(playlistTrack.playlistId, batch));
  }

  await Promise.all([
    db.delete(provider).where(eq(provider.userId, userId)),
    db.delete(likedTracks).where(eq(likedTracks.userId, userId)),
    db.delete(recentTracks).where(eq(recentTracks.userId, userId)),
    db.delete(playback).where(eq(playback.userId, userId)),
    db.delete(playbackHistory).where(eq(playbackHistory.userId, userId)),
    db.delete(topTracks).where(eq(topTracks.userId, userId)),
    db.delete(topArtists).where(eq(topArtists.userId, userId)),
  ]);

  await Promise.all([
    db.delete(top).where(eq(top.userId, userId)),
    db.delete(playlist).where(eq(playlist.userId, userId)),
  ]);

  await db.delete(profile).where(eq(profile.id, userId));
  await db.delete(user).where(eq(user.id, userId));
}

export async function getProfile(userId: string) {
  return db.query.profile.findFirst({
    where: eq(profile.id, userId),
  });
}

export async function getStats(userId: string, year: number) {
  const statsRecord = await db.query.stats.findFirst({
    where: and(eq(stats.userId, userId), eq(stats.year, year)),
  });

  if (!statsRecord) {
    return null;
  }

  let trackId: string | undefined;
  let artistId: string | undefined;
  let albumId: string | undefined;

  if (statsRecord.song) {
    const trackResult = await db
      .select({ id: track.id })
      .from(track)
      .where(eq(track.name, statsRecord.song))
      .limit(1);
    trackId = trackResult[0]?.id;
  }

  if (statsRecord.artist) {
    const artistResult = await db
      .select({ id: artist.id })
      .from(artist)
      .where(eq(artist.name, statsRecord.artist))
      .limit(1);
    artistId = artistResult[0]?.id;
  }

  if (statsRecord.album) {
    const albumResult = await db
      .select({ id: album.id })
      .from(album)
      .where(eq(album.name, statsRecord.album))
      .limit(1);
    albumId = albumResult[0]?.id;
  }

  return {
    liked: statsRecord.liked,
    played: statsRecord.played,
    minutes: Number.parseFloat(statsRecord.minutes.toString()),
    artist: statsRecord.artist || undefined,
    artistId,
    album: statsRecord.album || undefined,
    albumId,
    song: statsRecord.song || undefined,
    trackId,
  };
}

export async function hasStats(userId: string, year: number) {
  const statsRecord = await db.query.stats.findFirst({
    where: and(eq(stats.userId, userId), eq(stats.year, year)),
  });
  return !!statsRecord;
}

export async function getStatsSyncState(userId: string) {
  // Check for pending state first (most important for UI)
  const pendingSync = await db.query.sync.findFirst({
    where: and(
      eq(sync.userId, userId),
      eq(sync.type, "stats"),
      eq(sync.state, "pending"),
    ),
  });

  if (pendingSync) return "pending";

  // Otherwise return the most recent sync state
  const syncRecord = await db.query.sync.findFirst({
    where: and(eq(sync.userId, userId), eq(sync.type, "stats")),
    orderBy: desc(sync.updatedAt),
  });

  return syncRecord?.state ?? null;
}
