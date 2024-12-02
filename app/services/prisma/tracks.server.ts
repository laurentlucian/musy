import { prisma } from "../db.server";

export const trackWithInfo = {
  include: {
    liked: { orderBy: { createdAt: "asc" }, select: { user: true } },
    queue: {
      select: { owner: { select: { user: true } } },
      where: { action: "add" },
    }, // @todo: filter queue by same userId as recommended tile (idk how yet)  },
    recent: { orderBy: { playedAt: "asc" }, select: { user: true } },
  },
} as const;

export const profileWithInfo = {
  include: {
    playback: {
      include: {
        track: trackWithInfo,
      },
    },
    playbacks: {
      orderBy: { endedAt: "desc" },
      take: 1,
    },
  },
} as const;

export const getFeed = async (userId: string, limit = 10, offset = 0) => {
  const following = await prisma.follow.findMany({
    select: {
      followingId: true,
    },
    where: {
      followerId: userId,
    },
  });
  const userIds = [...following.map((f) => f.followingId), userId];

  const feed = await prisma.feed.findMany({
    include: {
      liked: {
        include: {
          track: trackWithInfo,
          user: profileWithInfo,
        },
      },
      playlist: {
        include: {
          playlist: true,
          track: true,
        },
      },
      queue: {
        include: {
          owner: { include: { user: profileWithInfo } },
          track: trackWithInfo,
          user: profileWithInfo,
        },
      },
      recommend: {
        include: {
          track: trackWithInfo,
          user: profileWithInfo,
        },
      },
      user: profileWithInfo,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: offset * limit,
    take: limit,
    where: {
      // NOT: {
      //   queue: null,
      // },
      userId: {
        in: userIds,
      },
    },
  });

  return feed;
};

export const getUserRecommended = async (userId: string) => {
  const recommended = await prisma.recommended.findMany({
    include: {
      track: trackWithInfo,
    },
    orderBy: { createdAt: "desc" },
    where: { userId },
  });

  return recommended.map((t) => t.track);
};

export const getUserRecent = async (userId: string) => {
  const recent = await prisma.recentSongs.findMany({
    include: {
      track: trackWithInfo,
    },
    orderBy: {
      playedAt: "desc",
    },
    take: 50,
    where: {
      userId,
    },
  });

  return recent.map((t) => t.track);
};

export const getUserLiked = async (userId: string) => {
  const liked = await prisma.likedSongs.findMany({
    include: {
      track: trackWithInfo,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    where: { userId },
  });

  return liked.map((t) => t.track);
};

export type TopLeaderboard = Awaited<ReturnType<typeof getTopLeaderboard>>;
export const getTopLeaderboard = async () => {
  const SEVEN_DAYS = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
  const trackIds = await prisma.recentSongs.groupBy({
    by: ["trackId"],
    orderBy: { _count: { trackId: "desc" } },
    take: 20,
    where: { playedAt: { gte: SEVEN_DAYS } },
  });

  const top = await prisma.track.findMany({
    include: {
      _count: {
        select: { recent: true },
      },
      ...trackWithInfo.include,
    },
    where: { id: { in: trackIds.map((t) => t.trackId) } },
  });

  top.sort((a, b) => {
    const aIndex = trackIds.findIndex((t) => t.trackId === a.id);
    const bIndex = trackIds.findIndex((t) => t.trackId === b.id);
    return aIndex - bIndex;
  });
  return top.map((t) => ({
    name: t.name,
    artist: t.artist,
    image: t.image,
    plays: t._count.recent,
    uri: t.uri,
  }));
};

export const getTrack = async (trackId: string) => {
  const track = await prisma.track.findUnique({
    where: { id: trackId },
  });

  return track;
};

export const getSessions = () => {
  return prisma.sessions.findMany({
    include: {
      songs: {
        include: {
          track: true,
        },
        orderBy: {
          playedAt: "desc",
        },
        take: 50,
      },
      user: {
        include: {
          playback: true,
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
    take: 30,
  });
};
