import { env } from "cloudflare:workers";
import { deleteAccount } from "../account-cleanup";
import { and, desc, eq } from "drizzle-orm";
import { profile, provider, stats, sync, user } from "~/lib.server/db/schema";
import { db } from "~/lib.server/services/db";
import { syncUserStats } from "~/lib.server/services/scheduler/scripts/sync/stats";

import { logError } from "~/components/utils";

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
    logError(
      {
        message: "getProvider error",
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
      },
      "db",
    );
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
    .where(and(eq(provider.revoked, "0"), eq(provider.type, "spotify")));
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
  await deleteAccount(env.D1, userId);
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

  return {
    liked: statsRecord.liked,
    played: statsRecord.played,
    minutes: Number.parseFloat(statsRecord.minutes.toString()),
    artist: statsRecord.artist || undefined,
    artistId: statsRecord.artistId ?? undefined,
    album: statsRecord.album || undefined,
    albumId: statsRecord.albumId ?? undefined,
    trackName: statsRecord.trackName || undefined,
    trackCount: statsRecord.trackCount,
    trackId: statsRecord.trackId ?? undefined,
  };
}

export async function hasStats(userId: string, year: number) {
  const statsRecord = await db.query.stats.findFirst({
    where: and(eq(stats.userId, userId), eq(stats.year, year)),
  });
  return !!statsRecord;
}

export async function getStatsSyncState(userId: string) {
  const syncRecord = await db.query.sync.findFirst({
    where: and(eq(sync.userId, userId), eq(sync.type, "stats")),
    orderBy: desc(sync.updatedAt),
  });

  return syncRecord?.state ?? null;
}
