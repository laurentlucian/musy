import { prisma } from "@lib/services/db.server";
import { SpotifyService } from "@lib/services/sdk/spotify.server";
import { createTrackModel } from "@lib/services/sdk/spotify/spotify.server";
import { log } from "@lib/utils";
import type { Prisma } from "@prisma/client";
import invariant from "tiny-invariant";

export async function syncUserLiked(userId: string, all = false) {
  log("starting...", "liked");

  const spotify = await SpotifyService.createFromUserId(userId);
  const client = spotify.getClient();
  invariant(client, "spotify client not found");

  const limit = 50;
  let offset = 0;

  const response = await client.getMySavedTracks({ limit, offset });
  const total = response.body.total;

  if (all) {
    while (offset < total) {
      const {
        body: { items: liked },
      } = await client.getMySavedTracks({
        limit,
        offset,
      });

      for (const { added_at, track } of liked) {
        const trackDb = createTrackModel(track);

        const data: Prisma.LikedSongsCreateInput = {
          action: "liked",
          createdAt: new Date(added_at),
          track: {
            connectOrCreate: {
              create: trackDb,
              where: { id: track.id },
            },
          },
          user: {
            connect: { id: userId },
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

      offset += limit;
      log(`processed ${offset}/${total} tracks`, "liked");
    }
  } else {
    for (const { added_at, track } of response.body.items) {
      const trackDb = createTrackModel(track);

      const data: Prisma.LikedSongsCreateInput = {
        action: "liked",
        createdAt: new Date(added_at),
        track: {
          connectOrCreate: {
            create: trackDb,
            where: { id: track.id },
          },
        },
        user: {
          connect: { id: userId },
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
  }

  log("completed", "liked");
}
