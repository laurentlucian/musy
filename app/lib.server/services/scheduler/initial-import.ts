import { env } from "cloudflare:workers";
import { and, eq, lt, lte, min, or, sql } from "drizzle-orm";
import {
  initialImport,
  likedTracks,
  recentTracks,
} from "~/lib.server/db/schema";
import type { Track } from "~/lib.server/sdk/spotify";
import { db } from "~/lib.server/services/db";
import { transformTracks } from "~/lib.server/services/sdk/helpers/spotify";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
import { syncUserRecent } from "./scripts/sync/recent";
import { syncUserStats, syncUserStatsAll } from "./scripts/sync/stats";
import { syncUserTop } from "./scripts/sync/top";

const LEASE_MS = 15 * 60_000;

export async function getInitialImport(
  userId: string,
): Promise<typeof initialImport.$inferSelect | null> {
  return (
    (
      await db
        .select()
        .from(initialImport)
        .where(eq(initialImport.userId, userId))
        .limit(1)
    )[0] ?? null
  );
}

export async function enqueueInitialImport(userId: string, delaySeconds = 0) {
  try {
    await env.DELIVERY_QUEUE.send(
      { type: "initial-import", userId },
      { delaySeconds: Math.min(delaySeconds, 43_200) },
    );
  } catch (error) {
    // The persisted checkpoint is picked up by the minute cron.
    console.error("Initial import enqueue failed", { userId, error });
  }
}

export async function retryInitialImport(userId: string) {
  const updated = await db
    .update(initialImport)
    .set({
      status: "queued",
      attempts: 0,
      retryAt: 0,
      lease: null,
      updatedAt: Date.now(),
    })
    .where(
      and(eq(initialImport.userId, userId), eq(initialImport.status, "failed")),
    )
    .returning();
  if (updated.length) await enqueueInitialImport(userId);
  return getInitialImport(userId);
}

export async function recoverInitialImports() {
  const now = Date.now();
  const jobs = await db
    .select({ userId: initialImport.userId })
    .from(initialImport)
    .where(
      or(
        and(
          eq(initialImport.status, "queued"),
          lte(initialImport.retryAt, now),
        ),
        and(
          eq(initialImport.status, "running"),
          lt(initialImport.updatedAt, now - LEASE_MS),
        ),
      ),
    )
    .limit(100);
  for (const job of jobs) await enqueueInitialImport(job.userId);
}

export async function processInitialImport(userId: string) {
  const now = Date.now();
  const lease = crypto.randomUUID();
  const [job] = await db
    .update(initialImport)
    .set({ status: "running", lease, updatedAt: now })
    .where(
      and(
        eq(initialImport.userId, userId),
        or(
          and(
            eq(initialImport.status, "queued"),
            lte(initialImport.retryAt, now),
          ),
          and(
            eq(initialImport.status, "running"),
            lt(initialImport.updatedAt, now - LEASE_MS),
          ),
        ),
      ),
    )
    .returning();
  if (!job) return;
  const owned = and(
    eq(initialImport.userId, userId),
    eq(initialImport.lease, lease),
  );
  try {
    const next: Partial<typeof initialImport.$inferInsert> = {
      status: "queued",
      attempts: 0,
      retryAt: 0,
      lease: null,
    };
    if (job.stage === "stats") {
      if (job.year === null) {
        await syncUserStatsAll({ userId });
        const [liked] = await db
          .select({ date: min(likedTracks.createdAt) })
          .from(likedTracks)
          .where(eq(likedTracks.userId, userId));
        const [recent] = await db
          .select({ date: min(recentTracks.playedAt) })
          .from(recentTracks)
          .where(eq(recentTracks.userId, userId));
        const years = [liked.date, recent.date]
          .filter((date): date is string => Boolean(date))
          .map((date) => new Date(date).getUTCFullYear())
          .filter(Number.isFinite);
        next.year = years.length
          ? Math.min(...years, new Date().getUTCFullYear())
          : new Date().getUTCFullYear();
      } else {
        await syncUserStats({ userId, year: job.year });
        next.year = job.year + 1;
        if (job.year >= new Date().getUTCFullYear()) next.status = "complete";
      }
    } else {
      const spotify = await getSpotifyClient({ userId });
      if (job.stage === "recent") {
        await syncUserRecent({ userId, spotify });
        next.stage = "top";
      } else if (job.stage === "top") {
        await syncUserTop({ userId, spotify });
        next.stage = "liked";
      } else {
        const page = await spotify.track.getUsersSavedTracks({
          limit: 50,
          offset: job.offset,
        });
        if (!page.items) throw new Error("Missing saved tracks response");
        const offset = job.offset + page.items.length;
        if (
          (page.next && page.items.length === 0) ||
          (!page.next && page.total !== undefined && offset < page.total)
        ) {
          throw new Error("Incomplete saved tracks page");
        }
        const items = page.items.filter(
          (item) => item.track?.id && item.added_at,
        );
        const tracks = items
          .map((item) => item.track)
          .filter((track): track is Track & { id: string } =>
            Boolean(track?.id),
          );
        const savedIds = new Set(await transformTracks(tracks));
        const savedItems = items.filter((item) =>
          savedIds.has(item.track!.id!),
        );
        for (let i = 0; i < savedItems.length; i += 20) {
          await db
            .insert(likedTracks)
            .values(
              savedItems.slice(i, i + 20).map((item) => ({
                userId,
                trackId: item.track!.id!,
                createdAt: new Date(item.added_at!).toISOString(),
              })),
            )
            .onConflictDoUpdate({
              target: [likedTracks.userId, likedTracks.trackId],
              set: { createdAt: sql`excluded.createdAt` },
            });
        }
        next.offset = offset;
        next.imported = job.imported + savedItems.length;
        next.total = page.total ?? next.offset;
        if (!page.next) next.stage = "stats";
      }
    }
    const updated = await db
      .update(initialImport)
      .set({ ...next, updatedAt: Date.now() })
      .where(owned)
      .returning();
    if (updated.length && next.status !== "complete")
      await enqueueInitialImport(userId);
  } catch (error) {
    console.error("Initial import failed", { userId, stage: job.stage, error });
    const attempts = job.attempts + 1;
    const retryAfter =
      error && typeof error === "object" && "retryAfter" in error
        ? Number(error.retryAfter)
        : 0;
    const delaySeconds = Math.max(
      Math.min(3600, 60 * 2 ** attempts),
      Number.isFinite(retryAfter) ? Math.ceil(retryAfter) : 0,
    );
    const status = attempts >= 5 ? "failed" : "queued";
    await db
      .update(initialImport)
      .set({
        status,
        attempts,
        lease: null,
        updatedAt: Date.now(),
        retryAt: Date.now() + delaySeconds * 1000,
      })
      .where(owned);
    if (status === "queued") await enqueueInitialImport(userId, delaySeconds);
  }
}
