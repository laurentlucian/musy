import { type Prisma, prisma } from "@lib/services/db.server";
import { createTrackModel } from "@lib/services/sdk/helpers/spotify.server";
import { log } from "@lib/utils";
import type Spotified from "spotified";

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

    if (!recent) throw new Error("No recent tracks found");

    for (const { played_at, track } of recent) {
      if (!track) throw new Error("No track found");
      const trackDb = createTrackModel(track);
      if (!played_at) throw new Error("No played at found");

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
            id: userId,
          },
        },
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
