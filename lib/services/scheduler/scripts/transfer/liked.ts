import { prisma } from "@lib/services/db.server";
import { GoogleService } from "@lib/services/sdk/google.server";
import { youtube } from "@lib/services/sdk/helpers/youtube.server";
import { log, sleep } from "@lib/utils";
import YTMusic from "ytmusic-api";

export async function transferUserLikedToYoutube(args: {
  userId: string;
  skip: number;
}) {
  const { userId, skip } = args;
  log(`transferring liked songs for ${args.userId}`, "transfer");
  const DELAY_BETWEEN_REQUESTS = 1000;

  const liked = await prisma.likedSongs.findMany({
    select: {
      track: {
        select: {
          name: true,
          artist: true,
        },
      },
      userId: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    skip,
    where: { userId, track: { provider: "spotify" } },
  });

  let processed = 0;
  try {
    const google = await GoogleService.createFromUserId(userId);

    const ytmusic = new YTMusic();
    await ytmusic.initialize();

    for (let i = 0; i < liked.length; i++) {
      const track = liked[i];

      const query = `${track.track.name} ${track.track.artist}`;

      const result = await ytmusic.search(query);

      const videoId =
        result[0].type === "SONG"
          ? result[0].videoId
          : result[0].type === "VIDEO"
            ? result[0].videoId
            : null;

      if (!videoId) continue;

      await youtube.addToLibrary(google, videoId);
      processed++;
      log(`transferred ${track.track.name}`, "transfer");

      await sleep(DELAY_BETWEEN_REQUESTS);
    }
  } catch {
    log(`processing ${processed} liked songs for ${args.userId}`, "transfer");
    await prisma.transfer.upsert({
      where: {
        userId_source_destination_type: {
          userId: args.userId,
          source: "spotify",
          destination: "youtube",
          type: "liked",
        },
      },
      update: {
        state: "failure",
        skip: args.skip + processed,
        total: liked.length,
      },
      create: {
        userId: args.userId,
        skip: args.skip + processed,
        destination: "youtube",
        source: "spotify",
        type: "liked",
        state: "failure",
        total: liked.length,
      },
    });
  }
}
