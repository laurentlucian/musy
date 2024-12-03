import type { Prisma } from "@prisma/client";
import debug from "debug";
import invariant from "tiny-invariant";
import { prisma } from "~/services/db.server";
import { createTrackModel } from "~/services/prisma/spotify.server";
import { SpotifyService } from "~/services/sdk/spotify.server";

const log = debug("musy:liked");

export async function syncUserLiked(userId: string) {
  log("starting...", userId);

  const spotify = await SpotifyService.createFromUserId(userId);
  const client = spotify.getClient();
  invariant(client, "spotify client not found");

  const {
    body: { items: liked, total },
  } = await client.getMySavedTracks({ limit: 50 });

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

  log("completed");
}
