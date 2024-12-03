import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { prisma } from "../db.server";

export const trackWithInfo = {
  include: {
    liked: { orderBy: { createdAt: "asc" } },
    recent: { orderBy: { playedAt: "asc" } },
  },
} satisfies Prisma.TrackDefaultArgs<DefaultArgs>;

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
} satisfies Prisma.ProfileDefaultArgs<DefaultArgs>;

export async function getFeed(userId: string, limit = 10, offset = 0) {
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
          owner: { include: { profile: profileWithInfo } },
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
      userId: {
        in: userIds,
      },
    },
  });

  return feed;
}

export async function getUserRecommended(userId: string) {
  const recommended = await prisma.recommended.findMany({
    include: {
      track: trackWithInfo,
    },
    orderBy: { createdAt: "desc" },
    where: { userId },
  });

  return recommended.map((t) => t.track);
}

export async function getUserRecent(userId: string) {
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
}

export async function getUserLiked(userId: string) {
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
}

export type TopLeaderboard = Awaited<ReturnType<typeof getTopLeaderboard>>;
export async function getTopLeaderboard() {
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
    },
    where: { id: { in: trackIds.map((t) => t.trackId) } },
  });

  top.sort((a, b) => {
    const aIndex = trackIds.findIndex((t) => t.trackId === a.id);
    const bIndex = trackIds.findIndex((t) => t.trackId === b.id);
    return aIndex - bIndex;
  });
  return top.map((t) => ({
    id: t.id,
    name: t.name,
    artist: t.artist,
    image: t.image,
    plays: t._count.recent,
    uri: t.uri,
  }));
}

export async function getTrack(trackId: string) {
  const track = await prisma.track.findUnique({
    where: { id: trackId },
  });

  return track;
}

export function getSessions() {
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
}
