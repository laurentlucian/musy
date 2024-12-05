import { prisma } from "@lib/services/db.server";
import { log } from "@lib/utils";

export const syncFeed = async () => {
  log("starting...", "feed");

  const [liked, recommended, playlistTracks] = await Promise.all([
    prisma.likedSongs.findMany({
      where: {
        feedId: null,
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
            id: item.userId,
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
            id: item.userId,
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
            id: item.playlist.userId,
          },
        },
      },
    });
  }

  if (liked.length > 0) {
    log(`liked items processed: ${liked.length}`, "feed");
  }

  if (recommended.length > 0) {
    log(`recommended items processed: ${recommended.length}`, "feed");
  }

  if (playlistTracks.length > 0) {
    log(`playlist tracks processed: ${playlistTracks.length}`, "feed");
  }

  log("completed", "feed");
};
