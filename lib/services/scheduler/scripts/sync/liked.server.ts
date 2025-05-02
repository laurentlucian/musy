import { type Prisma, prisma } from "@lib/services/db.server";
import { createTrackModel } from "@lib/services/sdk/helpers/spotify.server";
import { log } from "@lib/utils";
import type Spotified from "spotified";

export async function syncUserLiked({
  userId,
  spotify,
}: {
  userId: string;
  spotify: Spotified;
}) {
  try {
    const { items } = await spotify.track.getUsersSavedTracks({ limit: 50 });

    for (const { added_at, track } of items) {
      const trackDb = createTrackModel(track);
      const data: Prisma.LikedSongsCreateInput = {
        track: {
          connectOrCreate: {
            create: trackDb,
            where: {
              id: track.id,
            },
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      };

      if (!track.id) continue;

      await prisma.likedSongs.upsert({
        create: data,
        update: data,
        where: {
          trackId_userId: {
            trackId: track.id,
            userId,
          },
        },
      });
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

    for (const item of items) {
      const track = item.track;
      const trackModel = createTrackModel(track);

      if (!track.id) continue;

      // first ensure track exists
      await prisma.track.upsert({
        create: trackModel,
        update: trackModel,
        where: { id: track.id },
      });

      // then create/update liked relationship
      await prisma.likedSongs.upsert({
        create: {
          trackId: track.id,
          userId,
        },
        update: {},
        where: {
          trackId_userId: {
            trackId: track.id,
            userId,
          },
        },
      });
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
