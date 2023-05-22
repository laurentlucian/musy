import type { Prisma } from '@prisma/client';

import type { Activity } from '~/lib/types/types';
import { prisma } from '~/services/db.server';

export const getActivity = async () => {
  const [like, queue] = await Promise.all([
    prisma.likedSongs.findMany({
      include: {
        track: {
          include: {
            liked: { orderBy: { createdAt: 'asc' }, select: { user: true } },
            recent: { select: { user: true } },
          },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.queue.findMany({
      include: {
        owner: { select: { accessToken: false, user: true } },
        track: {
          include: { liked: { select: { user: true } }, recent: { select: { user: true } } },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      where: {
        action: 'send',
      },
    }),
  ]);
  if (like || queue) {
    return [...like, ...queue]
      .sort((a, b) => {
        if (a.createdAt && b.createdAt) return b.createdAt.getTime() - a.createdAt.getTime();
        return 0;
      })
      .slice(0, 20) as Activity[];
  }
  return null;
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
      liked: {
        include: {
          user: true,
        },
      },
      recent: {
        include: {
          user: true,
        },
      },
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

export type LeaderboardTracks = Prisma.PromiseReturnType<typeof getTopLeaderboard>;
