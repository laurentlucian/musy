import { and, eq, inArray } from "drizzle-orm";
import type Spotified from "spotified";
import { recentSongs, sync, track } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { createTrackModel } from "~/lib/services/sdk/helpers/spotify.server";
import { log, notNull } from "~/lib/utils";

export async function syncUserRecent({
  userId,
  spotify,
}: {
  userId: string;
  spotify: Spotified;
}) {
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

    // find existing tracks
    const trackIds = tracks.map((t) => t.id);
    const existingTracks = await db
      .select({ id: track.id })
      .from(track)
      .where(inArray(track.id, trackIds));
    const existingTrackIds = new Set(existingTracks.map((t) => t.id));

    // split into new and existing tracks
    const newTracks = tracks.filter((t) => !existingTrackIds.has(t.id));
    // const tracksToUpdate = tracks.filter((t) => existingTrackIds.has(t.id));

    // batch create new tracks
    if (newTracks.length) {
      const tracksToInsert = newTracks.map((t) => ({
        ...t,
        explicit: t.explicit ? "1" : "0",
      }));
      await db.insert(track).values(tracksToInsert);
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

        return {
          action: "played",
          playedAt: new Date(played_at),
          trackId: track.id,
          userId,
        };
      })
      .filter(notNull);

    // find existing recent songs
    const playedAts = recentSongsData.map((s) => s.playedAt.toISOString());
    const existingRecent = await db
      .select({ playedAt: recentSongs.playedAt })
      .from(recentSongs)
      .where(
        and(
          eq(recentSongs.userId, userId),
          inArray(recentSongs.playedAt, playedAts),
        ),
      );
    const existingRecentTimes = new Set(
      existingRecent.map((r) => new Date(r.playedAt).getTime()),
    );

    // split into new and existing recent songs
    const newRecent = recentSongsData.filter(
      (s) => !existingRecentTimes.has(s.playedAt.getTime()),
    );

    // batch create new recent songs
    if (newRecent.length) {
      const recentToInsert = newRecent.map((r) => ({
        ...r,
        playedAt: r.playedAt.toISOString(),
      }));
      await db.insert(recentSongs).values(recentToInsert);
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
