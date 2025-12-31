import { and, desc, eq, inArray } from "drizzle-orm";
import { recentTracks, sync, track } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { createTrackModel } from "~/lib/services/sdk/helpers/spotify.server";
import type { Spotified } from "~/lib/services/sdk/spotify.server";
import { log, notNull } from "~/lib/utils";

const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export async function syncUserRecent({
  userId,
  spotify,
}: {
  userId: string;
  spotify: Spotified;
}) {
  const recentSync = await db.query.sync.findFirst({
    where: and(
      eq(sync.userId, userId),
      eq(sync.type, "recent"),
      eq(sync.state, "success"),
    ),
    orderBy: desc(sync.updatedAt),
  });

  if (recentSync) {
    const updatedAt = new Date(recentSync.updatedAt).getTime();
    const now = Date.now();
    if (now - updatedAt < SYNC_COOLDOWN_MS) {
      log("skipped - recent sync exists", "recent");
      return;
    }
  }

  try {
    const { items: recent } = await spotify.player.getRecentlyPlayedTracks({
      limit: 50,
    });

    if (!recent?.length) throw new Error("No recent tracks found");

    // prepare tracks for batch creation/update
    const tracks = recent
      .map(({ track }) => {
        if (!track) return null;
        return createTrackModel(track);
      })
      .filter(notNull);

    // deduplicate tracks within the batch (same track can appear multiple times in recent history)
    const uniqueTracks = Array.from(
      new Map(tracks.map((t) => [t.id, t])).values(),
    );

    // find existing tracks (batch queries to respect D1 param limit)
    const trackIds = uniqueTracks.map((t) => t.id);
    const existingTrackIds = new Set<string>();
    const queryBatchSize = 99; // D1 limit is 100 params
    for (let i = 0; i < trackIds.length; i += queryBatchSize) {
      const batch = trackIds.slice(i, i + queryBatchSize);
      const existingTracks = await db
        .select({ id: track.id })
        .from(track)
        .where(inArray(track.id, batch));
      for (const t of existingTracks) {
        existingTrackIds.add(t.id);
      }
    }

    // split into new and existing tracks
    const newTracks = uniqueTracks.filter((t) => !existingTrackIds.has(t.id));
    // const tracksToUpdate = tracks.filter((t) => existingTrackIds.has(t.id));

    // batch create new tracks (D1 has 100 param limit, 13 columns = max 7 tracks per batch)
    if (newTracks.length) {
      const tracksToInsert = newTracks.map((t) => ({
        ...t,
        explicit: t.explicit ? "1" : "0",
      }));
      const batchSize = 7;
      for (let i = 0; i < tracksToInsert.length; i += batchSize) {
        const batch = tracksToInsert.slice(i, i + batchSize);
        await db.insert(track).values(batch).onConflictDoNothing();
      }
    }

    // batch update existing tracks
    // if (tracksToUpdate.length) {
    //   await prisma.$transaction(
    //     tracksToUpdate.map((track) =>
    //       prisma.track.update({
    //         where: { id: track.id },
    //         data: track,
    //       }),
    //     ),
    //   );
    // }

    // prepare recent tracks data
    const recentTracksData = recent
      .map(({ played_at, track }) => {
        if (!track?.id || !played_at) return null;

        const playedAtDate = new Date(played_at);
        return {
          action: "played",
          playedAt: playedAtDate,
          playedAtISO: playedAtDate.toISOString(),
          trackId: track.id,
          userId,
        };
      })
      .filter(notNull);

    log(
      `processing ${recentTracksData.length} recent tracks for ${userId}`,
      "recent",
    );

    // deduplicate recent tracks within the batch (same track at same time can appear multiple times)
    const uniqueRecentTracks = Array.from(
      new Map(
        recentTracksData.map((s) => [`${s.playedAtISO}-${s.userId}`, s]),
      ).values(),
    );

    log(
      `deduplicated to ${uniqueRecentTracks.length} unique recent tracks`,
      "recent",
    );

    // find existing recent tracks - use ISO strings for query (matching DB storage format)
    // Batch queries to respect D1 param limit (98 per batch: 1 for userId + 98 for IN array = 99 total, under 100 limit)
    const playedAtISOs = uniqueRecentTracks.map((s) => s.playedAtISO);
    const existingRecent: Array<{ playedAt: string | number }> = [];
    const recentQueryBatchSize = 98; // Account for userId parameter in and() condition
    for (let i = 0; i < playedAtISOs.length; i += recentQueryBatchSize) {
      const batch = playedAtISOs.slice(i, i + recentQueryBatchSize);
      const batchResults = await db
        .select({ playedAt: recentTracks.playedAt })
        .from(recentTracks)
        .where(
          and(
            eq(recentTracks.userId, userId),
            inArray(recentTracks.playedAt, batch),
          ),
        );
      existingRecent.push(...batchResults);
    }

    // normalize existing records to ISO strings for comparison
    const existingISOs = new Set(
      existingRecent
        .map((r) => {
          const playedAt = r.playedAt;
          // Normalize to ISO string format for consistent comparison
          if (typeof playedAt === "string") {
            // Already ISO string, use as-is
            return playedAt;
          }
          if (typeof playedAt === "number") {
            // Convert numeric timestamp to ISO string
            return new Date(playedAt).toISOString();
          }
          return null;
        })
        .filter((iso): iso is string => iso !== null),
    );

    log(
      `found ${existingISOs.size} existing recent tracks out of ${uniqueRecentTracks.length} checked`,
      "recent",
    );

    // split into new and existing recent tracks - compare ISO strings
    const newRecent = uniqueRecentTracks.filter(
      (s) => !existingISOs.has(s.playedAtISO),
    );

    log(`inserting ${newRecent.length} new recent tracks`, "recent");

    // batch create new recent tracks - store as ISO string (4 columns = max 25 per batch)
    if (newRecent.length) {
      const recentToInsert = newRecent.map((r) => ({
        userId: r.userId,
        trackId: r.trackId,
        action: r.action,
        playedAt: r.playedAtISO,
      }));
      const batchSize = 25;
      for (let i = 0; i < recentToInsert.length; i += batchSize) {
        const batch = recentToInsert.slice(i, i + batchSize);
        await db.insert(recentTracks).values(batch).onConflictDoNothing();
      }
    }

    log("completed", "recent");
    const now = new Date().toISOString();
    await db
      .insert(sync)
      .values({
        userId,
        state: "success",
        type: "recent",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [sync.userId, sync.state, sync.type],
        set: { state: "success", updatedAt: now },
      });
  } catch (error: unknown) {
    log("failure", "recent");
    const now = new Date().toISOString();
    await db
      .insert(sync)
      .values({
        userId,
        state: "failure",
        type: "recent",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [sync.userId, sync.state, sync.type],
        set: { state: "failure", updatedAt: now },
      });

    throw error; // Re-throw to let the machine handle the failure state
  }
}
