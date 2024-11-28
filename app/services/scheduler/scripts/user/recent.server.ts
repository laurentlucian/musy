import type { Prisma } from "@prisma/client";
import debug from "debug";
import { prisma } from "~/services/db.server";
import { createTrackModel } from "~/services/prisma/spotify.server";
import { getSpotifyClient } from "~/services/spotify.server";

const log = debug("musy:recent");

export async function syncUserRecent(userId: string) {
  log("starting...");

  const { spotify } = await getSpotifyClient(userId);

  if (!spotify) {
    log("no spotify client");
    return;
  }

  log("adding recent tracks to db");
  const {
    body: { items: recent },
  } = await spotify.getMyRecentlyPlayedTracks({ limit: 50 });

  for (const { played_at, track } of recent) {
    const trackDb = createTrackModel(track);
    const data: Prisma.RecentSongsCreateInput = {
      action: "played",
      playedAt: new Date(played_at),
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
          userId,
        },
      },
      verifiedFromSpotify: true,
    };

    const playedAt = new Date(played_at);
    await prisma.recentSongs.upsert({
      create: data,
      update: data,
      where: {
        playedAt_userId: {
          playedAt,
          userId,
        },
      },
    });
  }

  log("completed");
}
