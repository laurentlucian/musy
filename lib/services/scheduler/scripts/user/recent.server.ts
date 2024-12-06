import { prisma } from "@lib/services/db.server";
import { SpotifyService } from "@lib/services/sdk/spotify.server";
import { createTrackModel } from "@lib/services/sdk/spotify/spotify.server";
import { log } from "@lib/utils";
import type { Prisma } from "@prisma/client";
import invariant from "tiny-invariant";

export async function syncUserRecent(userId: string) {
  try {
    log("starting...", "recent");

    const spotify = await SpotifyService.createFromUserId(userId);
    const client = spotify.getClient();
    invariant(client, "spotify client not found");

    log("adding recent tracks to db", "recent");
    const {
      body: { items: recent },
    } = await client.getMyRecentlyPlayedTracks({ limit: 50 });

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
  } catch {
    log("failure", "recent");
  }
}