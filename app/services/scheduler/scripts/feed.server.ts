import debug from "debug";
import { prisma } from "~/services/db.server";

const log = debug("musy:feed");

export const syncFeed = async () => {
  log("starting...");

  const [liked, queue, recommended, playlistTracks] = await Promise.all([
    prisma.likedSongs.findMany({
      where: {
        feedId: null,
      },
    }),
    prisma.queue.findMany({
      where: {
        AND: {
          action: "send",
          feedId: null,
        },
      },
    }),
    prisma.recommended.findMany({
      where: {
        feedId: null,
      },
    }),
    prisma.playlistTrack.findMany({
      include: {
        playlist: {
          select: {
            userId: true,
          },
        },
      },
      where: {
        feedId: null,
      },
    }),
  ]);

  for (const item of liked) {
    await prisma.feed.create({
      data: {
        createdAt: item.createdAt,
        liked: {
          connect: {
            id: item.id,
          },
        },
        user: {
          connect: {
            userId: item.userId,
          },
        },
      },
    });
  }

  for (const item of queue) {
    if (!item.userId) continue;
    await prisma.feed.create({
      data: {
        createdAt: item.createdAt,
        queue: {
          connect: {
            id: item.id,
          },
        },
        user: {
          connect: {
            userId: item.userId,
          },
        },
      },
    });
  }

  for (const item of recommended) {
    await prisma.feed.create({
      data: {
        createdAt: item.createdAt,
        recommend: {
          connect: {
            id: item.id,
          },
        },
        user: {
          connect: {
            userId: item.userId,
          },
        },
      },
    });
  }

  for (const item of playlistTracks) {
    await prisma.feed.create({
      data: {
        createdAt: item.addedAt,
        playlist: {
          connect: {
            playlistId_trackId: {
              playlistId: item.playlistId,
              trackId: item.trackId,
            },
          },
        },
        user: {
          connect: {
            userId: item.playlist.userId,
          },
        },
      },
    });
  }

  if (liked.length > 0) {
    log("liked items processed", liked.length);
  }

  if (queue.length > 0) {
    log("queue items processed", queue.length);
  }

  if (recommended.length > 0) {
    log("recommended items processed", recommended.length);
  }

  if (playlistTracks.length > 0) {
    log("playlist tracks processed", playlistTracks.length);
  }

  log("completed");
};
