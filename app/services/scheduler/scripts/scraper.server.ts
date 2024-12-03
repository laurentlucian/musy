import type { Prisma } from "@prisma/client";
import invariant from "tiny-invariant";
import { prisma } from "~/services/db.server";
import { SpotifyService } from "~/services/sdk/spotify.server";
import { createTrackModel } from "~/services/sdk/spotify/spotify.server";

export const scraper = async (userId: string) => {
  const limit = 50;
  const pages = 10;

  const spotify = await SpotifyService.createFromUserId(userId);
  const client = spotify.getClient();
  invariant(client, "scraper -> spotify client not found");

  // loop through pages backwards; cases where user has too many liked songs;
  // ideally, we'd want to put this in a higher time out so api limit doesn't fail the job
  for (let i = pages; i > 1; i--) {
    const {
      body: { items: liked },
    } = await client.getMySavedTracks({ limit, offset: i * limit });
    console.log("scraper -> adding page", i);
    for (const { added_at, track } of liked) {
      const trackDb = createTrackModel(track);
      const data: Prisma.LikedSongsCreateInput = {
        action: "liked",
        createdAt: new Date(added_at),
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

    // sleep for 5 seconds to avoid api limit
    console.log("scraper -> sleeping for 5 seconds");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
};
