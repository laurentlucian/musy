import { type Prisma, prisma } from "@lib/services/db.server";
import { createTrackModel } from "@lib/services/sdk/helpers/spotify.server";
import { getSpotifyClient } from "@lib/services/sdk/spotify.server";
import { log } from "@lib/utils";
import type SpotifyWebApi from "spotify-web-api-node";

export async function syncUserLiked({
  userId,
  spotify,
}: {
  userId: string;
  spotify: SpotifyWebApi;
}) {
  try {
    log("starting...", "liked");

    log("getting liked tracks", "liked");
    const { body } = await spotify.getMySavedTracks({ limit: 50 });

    for (const { added_at, track } of body.items) {
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
  } catch (error: unknown) {
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
    throw error;
  }
}

export async function syncUserLikedPage({
  userId,
  spotify,
  offset,
}: {
  userId: string;
  spotify: SpotifyWebApi;
  offset: number;
}) {
  try {
    const { body } = await spotify.getMySavedTracks({ limit: 50, offset });

    for (const item of body.items) {
      const track = item.track;
      const trackModel = createTrackModel(track);

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
      nextOffset: offset + body.items.length,
      total: body.total,
    };
  } catch (error) {
    log("failure", "liked-page");
    throw error;
  }
}
