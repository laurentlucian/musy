import { prisma } from "@lib/services/db.server";
import { createTrackModel } from "@lib/services/sdk/helpers/spotify.server";
import type Spotified from "@lib/services/sdk/spotified";
import { log, notNull } from "@lib/utils";

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
    const existingTracks = await prisma.track.findMany({
      where: { id: { in: trackIds } },
      select: { id: true },
    });
    const existingTrackIds = new Set(existingTracks.map((t) => t.id));

    // split into new and existing tracks
    const newTracks = tracks.filter((t) => !existingTrackIds.has(t.id));
    // const tracksToUpdate = tracks.filter((t) => existingTrackIds.has(t.id));

    // batch create new tracks
    if (newTracks.length) {
      await prisma.track.createMany({ data: newTracks });
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
    const recentSongs = recent
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
    const existingRecent = await prisma.recentSongs.findMany({
      where: {
        userId,
        playedAt: { in: recentSongs.map((s) => s.playedAt) },
      },
      select: { playedAt: true },
    });
    const existingRecentTimes = new Set(
      existingRecent.map((r) => r.playedAt.getTime()),
    );

    // split into new and existing recent songs
    const newRecent = recentSongs.filter(
      (s) => !existingRecentTimes.has(s.playedAt.getTime()),
    );

    // batch create new recent songs
    if (newRecent.length) {
      await prisma.recentSongs.createMany({ data: newRecent });
    }

    log("completed", "recent");
    await prisma.sync.upsert({
      create: {
        userId,
        state: "success",
        type: "recent",
      },
      update: {
        state: "success",
      },
      where: {
        userId_type_state: { userId, type: "recent", state: "success" },
      },
    });
  } catch (error: unknown) {
    log("failure", "recent");
    await prisma.sync.upsert({
      create: {
        userId,
        state: "failure",
        type: "recent",
      },
      update: {
        state: "failure",
      },
      where: {
        userId_type_state: { userId, type: "recent", state: "failure" },
      },
    });

    throw error; // Re-throw to let the machine handle the failure state
  }
}
