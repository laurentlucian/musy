import type Spotified from "spotified";
import { prisma } from "~/lib/services/db.server";
import { createTrackModel } from "~/lib/services/sdk/helpers/spotify.server";
import { log, notNull } from "~/lib/utils";

export async function syncUserLiked({
  userId,
  spotify,
}: {
  userId: string;
  spotify: Spotified;
}) {
  try {
    const { items } = await spotify.track.getUsersSavedTracks({ limit: 50 });

    // prepare tracks for batch creation/update
    const tracks = items
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

    // prepare liked songs data
    const likedSongs = items
      .map(({ track }) => {
        if (!track?.id) return null;
        return {
          trackId: track.id,
          userId,
        };
      })
      .filter(notNull);

    // find existing liked songs
    const existingLiked = await prisma.likedSongs.findMany({
      where: {
        userId,
        trackId: { in: trackIds },
      },
      select: { trackId: true },
    });
    const existingLikedIds = new Set(existingLiked.map((l) => l.trackId));

    // create new liked songs
    const newLiked = likedSongs.filter((l) => !existingLikedIds.has(l.trackId));
    if (newLiked.length) {
      await prisma.likedSongs.createMany({ data: newLiked });
    }

    log("completed", "liked");
    await prisma.sync.upsert({
      create: {
        userId,
        state: "success",
        type: "liked",
      },
      update: {
        state: "success",
      },
      where: {
        userId_type_state: { userId, type: "liked", state: "success" },
      },
    });
  } catch (error) {
    console.log("error", error);
    log("failure", "liked");
    await prisma.sync.upsert({
      create: {
        userId,
        state: "failure",
        type: "liked",
      },
      update: {
        state: "failure",
      },
      where: {
        userId_type_state: { userId, type: "liked", state: "failure" },
      },
    });
  }
}

export async function syncUserLikedPage({
  userId,
  spotify,
  offset,
}: {
  userId: string;
  spotify: Spotified;
  offset: number;
}) {
  try {
    const { items, total } = await spotify.track.getUsersSavedTracks({
      limit: 50,
      offset,
    });

    // prepare tracks for batch creation/update
    const tracks = items
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
    const tracksToUpdate = tracks.filter((t) => existingTrackIds.has(t.id));

    // batch create new tracks
    if (newTracks.length) {
      await prisma.track.createMany({ data: newTracks });
    }

    // batch update existing tracks
    if (tracksToUpdate.length) {
      await prisma.$transaction(
        tracksToUpdate.map((track) =>
          prisma.track.update({
            where: { id: track.id },
            data: track,
          }),
        ),
      );
    }

    // prepare liked songs data
    const likedSongs = items
      .map(({ track }) => {
        if (!track?.id) return null;
        return {
          trackId: track.id,
          userId,
        };
      })
      .filter(notNull);

    // find existing liked songs
    const existingLiked = await prisma.likedSongs.findMany({
      where: {
        userId,
        trackId: { in: trackIds },
      },
      select: { trackId: true },
    });
    const existingLikedIds = new Set(existingLiked.map((l) => l.trackId));

    // create new liked songs
    const newLiked = likedSongs.filter((l) => !existingLikedIds.has(l.trackId));
    if (newLiked.length) {
      await prisma.likedSongs.createMany({ data: newLiked });
    }

    return {
      nextOffset: offset + items.length,
      total,
    };
  } catch (error) {
    log("failure", "liked-page");
    throw error;
  }
}
