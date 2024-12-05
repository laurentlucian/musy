import { prisma } from "@lib/services/db.server";

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
          track: true,
          user: true,
        },
      },
      playlist: {
        include: {
          playlist: true,
          track: true,
        },
      },
      recommend: {
        include: {
          track: true,
          user: true,
        },
      },
      user: true,
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
      track: true,
    },
    orderBy: { createdAt: "desc" },
    where: { userId },
  });

  return recommended.map((t) => t.track);
}

export type UserRecent = ReturnType<typeof getUserRecent>;
export async function getUserRecent(args: {
  userId: string;
  provider: string;
}) {
  const { userId, provider } = args;
  const recent = await prisma.recentSongs.findMany({
    include: {
      track: true,
    },
    orderBy: {
      playedAt: "desc",
    },
    take: 10,
    where: {
      userId,
      track: { provider },
    },
  });

  const count = await prisma.recentSongs.count({
    where: { userId, track: { provider } },
  });

  return { count, tracks: recent.map((t) => t.track) };
}

export type UserLiked = ReturnType<typeof getUserLiked>;
export async function getUserLiked(args: {
  userId: string;
  provider: string;
}) {
  const { userId, provider } = args;
  const liked = await prisma.likedSongs.findMany({
    select: {
      track: {
        select: {
          _count: true,
          id: true,
          name: true,
          artist: true,
          image: true,
          uri: true,
        },
      },

      userId: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    where: { userId, track: { provider } },
  });
  const count = await prisma.likedSongs.count({
    where: { userId, track: { provider } },
  });

  return { count, tracks: liked.map((t) => t.track) };
}

export type TopLeaderboard = Awaited<ReturnType<typeof getTopLeaderboard>>;
export async function getTopLeaderboard() {
  const LAST_3_DAYS = new Date(Date.now() - 1000 * 60 * 60 * 24 * 3);
  const trackIds = await prisma.recentSongs.groupBy({
    by: ["trackId"],
    orderBy: { _count: { trackId: "desc" } },
    take: 20,
    where: { playedAt: { gte: LAST_3_DAYS } },
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
