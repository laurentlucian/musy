import { prisma } from "@lib/services/db.server";
import { createTrackModel } from "@lib/services/sdk/helpers/spotify.server";
import { SpotifyService } from "@lib/services/sdk/spotify.server";
import { log } from "@lib/utils";
import type { Prisma } from "@prisma/client";
import invariant from "tiny-invariant";

export async function syncUserLiked(userId: string) {
  try {
    log("starting...", "liked");

    const spotify = await SpotifyService.createFromUserId(userId);
    const client = spotify.getClient();
    invariant(client, "spotify client not found");

    log("getting liked tracks", "liked");
    const { body } = await client.getMySavedTracks({ limit: 50 });

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
