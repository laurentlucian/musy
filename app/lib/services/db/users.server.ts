import { and, eq, inArray } from "drizzle-orm";
import {
  likedTracks,
  playback,
  playbackHistory,
  playlist,
  playlistTrack,
  profile,
  provider,
  recentTracks,
  stats,
  top,
  topArtists,
  topTracks,
  trackToArtist,
  user,
} from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { syncUserStats } from "~/lib/services/scheduler/scripts/sync/stats.server";

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

  await Promise.all(
    [
      db.delete(provider).where(eq(provider.userId, userId)),
      db.delete(likedTracks).where(eq(likedTracks.userId, userId)),
      db.delete(recentTracks).where(eq(recentTracks.userId, userId)),
      db.delete(playback).where(eq(playback.userId, userId)),
      db.delete(playbackHistory).where(eq(playbackHistory.userId, userId)),
      playlistIds.length > 0 &&
        db
          .delete(playlistTrack)
          .where(inArray(playlistTrack.playlistId, playlistIds)),
      db.delete(topTracks).where(eq(topTracks.userId, userId)),
      db.delete(topArtists).where(eq(topArtists.userId, userId)),
    ].filter(Boolean),
  );

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
  let statsRecord = await db.query.stats.findFirst({
    where: and(eq(stats.userId, userId), eq(stats.year, year)),
  });

  if (!statsRecord) {
    await syncUserStats({ userId, year });
    statsRecord = await db.query.stats.findFirst({
      where: and(eq(stats.userId, userId), eq(stats.year, year)),
    });
  }

  if (!statsRecord) {
    return {
      liked: 0,
      played: 0,
      minutes: 0,
      artist: undefined,
      album: undefined,
      song: undefined,
    };
  }

  return {
    liked: statsRecord.liked,
    played: statsRecord.played,
    minutes: Number.parseFloat(statsRecord.minutes.toString()),
    artist: statsRecord.artist || undefined,
    album: statsRecord.album || undefined,
    song: statsRecord.song || undefined,
  };
}
