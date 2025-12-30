import { and, desc, eq, inArray } from "drizzle-orm";
import type Spotified from "spotified";
import { recentSongs, sync, track } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { createTrackModel } from "~/lib/services/sdk/helpers/spotify.server";
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

    // find existing tracks
    const trackIds = uniqueTracks.map((t) => t.id);
    const existingTracks = await db
      .select({ id: track.id })
      .from(track)
      .where(inArray(track.id, trackIds));
    const existingTrackIds = new Set(existingTracks.map((t) => t.id));

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

    // prepare recent songs data
    const recentSongsData = recent
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
      `processing ${recentSongsData.length} recent songs for ${userId}`,
      "recent",
    );

    // deduplicate recent songs within the batch (same track at same time can appear multiple times)
    const uniqueRecentSongs = Array.from(
      new Map(
        recentSongsData.map((s) => [`${s.playedAtISO}-${s.userId}`, s]),
      ).values(),
    );

    log(
      `deduplicated to ${uniqueRecentSongs.length} unique recent songs`,
      "recent",
    );

    // find existing recent songs - use ISO strings for query (matching DB storage format)
    const playedAtISOs = uniqueRecentSongs.map((s) => s.playedAtISO);
    const existingRecent = await db
      .select({ playedAt: recentSongs.playedAt })
      .from(recentSongs)
      .where(
        and(
          eq(recentSongs.userId, userId),
          inArray(recentSongs.playedAt, playedAtISOs),
        ),
      );

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
      `found ${existingISOs.size} existing recent songs out of ${uniqueRecentSongs.length} checked`,
      "recent",
    );

    // split into new and existing recent songs - compare ISO strings
    const newRecent = uniqueRecentSongs.filter(
      (s) => !existingISOs.has(s.playedAtISO),
    );

    log(`inserting ${newRecent.length} new recent songs`, "recent");

    // batch create new recent songs - store as ISO string (4 columns = max 25 per batch)
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
        await db.insert(recentSongs).values(batch).onConflictDoNothing();
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
