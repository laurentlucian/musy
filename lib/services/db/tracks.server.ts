import { prisma } from "@lib/services/db.server";

export async function getFeed(args?: { limit?: number; offset?: number }) {
  const { limit = 20, offset = 0 } = args ?? {};
  const feed = await prisma.feed.findMany({
    include: {
      liked: {
        include: {
          track: true,
        },
      },
      playlist: {
        include: {
          track: true,
        },
      },
      recommend: {
        include: {
          track: true,
        },
      },
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: offset * limit,
    take: limit,
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
export async function getUserLiked(args: { userId: string; provider: string }) {
  const { userId, provider } = args;
  const liked = await prisma.likedSongs.findMany({
    select: {
      track: true,
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
    provider: t.provider,
    albumName: t.albumName,
    albumUri: t.albumUri,
    artistUri: t.artistUri,
    explicit: t.explicit,
    duration: t.duration,
    preview_url: t.preview_url,
    link: t.link,
  }));
}

export async function getTrack(trackId: string) {
  const track = await prisma.track.findUnique({
    where: { id: trackId },
  });

  return track;
}

export async function getPlaybacks() {
  return prisma.playback.findMany({
    select: {
      track: true,
    },
    orderBy: {
      track: {
        recent: {
          _count: "desc",
        },
      },
    },
  });
}
