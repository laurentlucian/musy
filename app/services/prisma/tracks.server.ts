import type { Activity } from '~/lib/types/types';
import { prisma } from '~/services/db.server';

export const trackWithInfo = {
  include: {
    liked: { orderBy: { createdAt: 'asc' }, select: { user: true } },
    queue: { select: { owner: { select: { user: true } } }, where: { action: 'add' } }, // @todo: filter queue by same userId as recommended tile (idk how yet)  },
    recent: { orderBy: { playedAt: 'asc' }, select: { user: true } },
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
      orderBy: { endedAt: 'desc' },
      take: 1,
    },
  },
} as const;

export const getPlaybackFeed = async (userIds: string[]) => {
  const playbacks = await prisma.playbackHistory.findMany({
    include: {
      user: profileWithInfo,
    },
    orderBy: { endedAt: 'desc' },
    take: 10,
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  let feed = [] as Activity[];

  const promises = playbacks.map(async (playback) => {
    feed.push({
      action: 'playback',
      createdAt: playback.endedAt,
      playback,
      user: playback.user,
      userId: playback.userId,
    });
  });

  await Promise.all(promises);

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
      take: 10,
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
      take: 10,
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
      take: 10,
      where: {
        userId: {
          in: userIds,
        },
      },
    }),
    getPlaybackFeed(userIds),
  ]);

  const activity = [...like, ...queue, ...recommended, ...playbacks]
    .sort((a, b) => {
      if (a.createdAt && b.createdAt) return b.createdAt.getTime() - a.createdAt.getTime();
      return 0;
    })
    .slice(0, 20) as Activity[];

  const addTracksToPlayback = activity.map(async (a) => {
    if (a.action === 'playback' && a.playback) {
      const recent = await prisma.recentSongs.findMany({
        include: {
          track: trackWithInfo,
        },
        orderBy: {
          playedAt: 'desc',
        },
        take: 4,
        where: {
          playedAt: { gte: a.playback.startedAt, lte: a.playback.endedAt },
          userId: a.playback.userId,
        },
      });
      return { ...a, tracks: recent.map((r) => r.track) };
    }

    return a;
  });

  const activityWithPlaybackTracks = await Promise.all(addTracksToPlayback);

  return activityWithPlaybackTracks;
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
