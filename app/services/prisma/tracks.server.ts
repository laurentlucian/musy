import type { Activity } from '~/lib/types/types';
import { prisma } from '~/services/db.server';

export const trackWithInfo = {
  track: {
    include: {
      liked: { orderBy: { createdAt: 'asc' }, select: { user: true } },
      queue: { select: { owner: { select: { user: true } } }, where: { action: 'add' } }, // @todo: filter queue by same userId as recommended tile (idk how yet)  },
      recent: { select: { user: true } },
    },
  },
} as const;

export const getActivity = async (userId: string) => {
  const following = (
    await prisma.follow.findMany({
      select: {
        followingId: true,
      },
      where: {
        followerId: userId,
      },
    })
  ).map((f) => f.followingId);

  const [like, queue, recommended] = await Promise.all([
    prisma.likedSongs.findMany({
      include: {
        ...trackWithInfo,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      where: {
        userId: {
          in: following,
        },
      },
      take: 20,
    }),
    prisma.queue.findMany({
      include: {
        owner: { select: { accessToken: false, user: true } },
        ...trackWithInfo,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      where: {
        action: 'send',
        OR: [{ userId: { in: following } }, { ownerId: { in: following } }],
      },
    }),
    prisma.recommended.findMany({
      include: {
        ...trackWithInfo,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      where: {
        userId: {
          in: following,
        },
      },
      take: 20,
    }),
  ]);
  return [...like, ...queue, ...recommended]
    .sort((a, b) => {
      if (a.createdAt && b.createdAt) return b.createdAt.getTime() - a.createdAt.getTime();
      return 0;
    })
    .slice(0, 20) as Activity[];
};

export const getUserRecommended = async (userId: string) => {
  const recommended = await prisma.recommended.findMany({
    include: {
      ...trackWithInfo,
    },
    orderBy: { createdAt: 'desc' },
    where: { userId },
  });

  return recommended.map((t) => t.track);
};

export const getUserRecent = async (userId: string) => {
  const recent = await prisma.recentSongs.findMany({
    include: {
      ...trackWithInfo,
    },
    orderBy: {
      playedAt: 'desc',
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
      ...trackWithInfo,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
    where: { userId },
  });

  return liked.map((t) => t.track);
};

export const getTopLeaderboard = async () => {
  const SEVEN_DAYS = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
  const trackIds = await prisma.recentSongs.groupBy({
    by: ['trackId'],
    orderBy: { _count: { trackId: 'desc' } },
    take: 10,
    where: { playedAt: { gte: SEVEN_DAYS } },
  });

  const top = await prisma.track.findMany({
    include: {
      _count: {
        select: { recent: true },
      },
      ...trackWithInfo.track.include,
    },
    where: { id: { in: trackIds.map((t) => t.trackId) } },
  });

  top.sort((a, b) => {
    const aIndex = trackIds.findIndex((t) => t.trackId === a.id);
    const bIndex = trackIds.findIndex((t) => t.trackId === b.id);
    return aIndex - bIndex;
  });
  return top;
};
