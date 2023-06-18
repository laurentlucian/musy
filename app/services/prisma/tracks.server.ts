import type { Prisma } from '@prisma/client';

import type { Activity } from '~/lib/types/types';
import { prisma } from '~/services/db.server';

export const trackWithInfo: Prisma.TrackArgs = {
  include: {
    liked: { orderBy: { createdAt: 'asc' }, select: { user: true } },
    queue: { select: { owner: { select: { user: true } } }, where: { action: 'add' } }, // @todo: filter queue by same userId as recommended tile (idk how yet)  },
    recent: { orderBy: { playedAt: 'asc' }, select: { user: true } },
  },
};

export const profileWithInfo: Prisma.ProfileArgs = {
  include: {
    playback: { include: { track: trackWithInfo } },
  },
};

export const getPlaybackFeed = async (userIds: string[]) => {
  const playbacks = await prisma.playbackHistory.findMany({
    include: {
      user: profileWithInfo,
    },
    orderBy: { endedAt: 'desc' },
    take: 20,
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  let feed = [];

  for (const playback of playbacks) {
    const recent = await prisma.recentSongs.findMany({
      include: {
        track: trackWithInfo,
      },
      orderBy: {
        playedAt: 'desc',
      },

      where: {
        playedAt: { gte: playback.startedAt, lte: playback.endedAt },
        userId: playback.userId,
      },
    });

    feed.push({
      action: 'playback',
      createdAt: playback.endedAt,
      playback,
      tracks: recent.map((r) => r.track),
      user: playback.user,
      userId: playback.userId,
    });
  }

  return feed;
};

export const getActivity = async (userId: string) => {
  const following = await prisma.follow.findMany({
    select: {
      followingId: true,
    },
    where: {
      followerId: userId,
    },
  });
  const userIds = [...following.map((f) => f.followingId), userId];

  const [like, queue, recommended, playbacks] = await Promise.all([
    prisma.likedSongs.findMany({
      include: {
        track: trackWithInfo,
        user: profileWithInfo,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      where: {
        userId: {
          in: userIds,
        },
      },
    }),
    prisma.queue.findMany({
      include: {
        owner: { select: { accessToken: false, user: profileWithInfo } },
        track: trackWithInfo,
        user: profileWithInfo,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      where: {
        OR: [{ userId: { in: userIds } }, { ownerId: { in: userIds } }],
        action: 'send',
      },
    }),
    prisma.recommended.findMany({
      include: {
        track: trackWithInfo,
        user: profileWithInfo,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      where: {
        userId: {
          in: userIds,
        },
      },
    }),
    getPlaybackFeed(userIds),
  ]);
  return [...like, ...queue, ...recommended, ...playbacks]
    .sort((a, b) => {
      if (a.createdAt && b.createdAt) return b.createdAt.getTime() - a.createdAt.getTime();
      return 0;
    })
    .slice(0, 50) as Activity[];
};

export const getUserRecommended = async (userId: string) => {
  const recommended = await prisma.recommended.findMany({
    include: {
      track: trackWithInfo,
    },
    orderBy: { createdAt: 'desc' },
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
      track: trackWithInfo,
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
      ...trackWithInfo.include,
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

export const getTrack = async (trackId: string) => {
  const track = await prisma.track.findUnique({
    where: { id: trackId },
  });

  return track;
};
