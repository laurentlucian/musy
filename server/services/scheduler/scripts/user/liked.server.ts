import type { Prisma } from "@prisma/client";
import debug from "debug";
import { prisma } from "server/services/db.server";
import { createTrackModel } from "server/services/prisma/spotify.server";
import { getSpotifyClient } from "server/services/spotify.server";

const log = debug("musy:liked");

export async function syncUserLiked(userId: string) {
  log("starting...", userId);

  const { spotify } = await getSpotifyClient(userId);

  if (!spotify) {
    log("no spotify client");
    return;
  }

  const {
    body: { items: liked, total },
  } = await spotify.getMySavedTracks({ limit: 50 });

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
        connect: { userId },
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

  // Rest of the existing logic...
  log("completed");
}
