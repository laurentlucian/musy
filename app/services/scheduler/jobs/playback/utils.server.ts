import type { Prisma } from '@prisma/client';
import invariant from 'tiny-invariant';

import { prisma } from '~/services/db.server';
import { createTrackModel } from '~/services/prisma/spotify.server';
import { getSpotifyClient } from '~/services/spotify.server';

import { debugCreatorQ, playbackQ } from '../playback.server';

export const upsertPlayback = async (
  userId: string,
  playback: SpotifyApi.CurrentPlaybackResponse,
) => {
  const { progress_ms: progress, timestamp } = playback;
  if (!playback.item || playback.item.type !== 'track' || !progress || !timestamp) return;

  const track = createTrackModel(playback.item);
  const data = {
    progress,
    timestamp,
    track: {
      connectOrCreate: {
        create: track,
        where: {
          id: track.id,
        },
      },
    },
  };

  await prisma.playback.upsert({
    create: {
      ...data,
      user: {
        connect: {
          userId,
        },
      },
    },
    update: {
      ...data,
    },
    where: {
      userId,
    },
  });

  const endedAt = new Date(timestamp + track.duration);

  const recentlyAdded = await prisma.recentSongs.findFirst({
    where: {
      playedAt: {
        gte: new Date(endedAt.getTime() - 1000 * 60 * 2),
        lte: new Date(endedAt.getTime() + 1000 * 60 * 2),
      },
      trackId: track.id,
    },
  });

  if (!recentlyAdded) {
    const recentSongs: Prisma.RecentSongsCreateInput = {
      action: 'played',
      playedAt: endedAt,
      track: {
        connectOrCreate: {
          create: track,
          where: {
            id: track.id,
          },
        },
      },
      user: {
        connect: {
          userId,
        },
      },
      verifiedFromSpotify: false,
    };

    await prisma.recentSongs.upsert({
      create: recentSongs,
      update: recentSongs,
      where: { playedAt_userId: { playedAt: endedAt, userId } },
    });
  }
};

export const getPlaybackState = async (id: string) => {
  try {
    const { spotify } = await getSpotifyClient(id);
    invariant(spotify, 'Spotify API not found');
    const { body: playback } = await spotify.getMyCurrentPlaybackState();
    const { is_playing, item } = playback;
    if (!is_playing || !item || item.type !== 'track') return { id, playback: null };
    return { id, playback };
  } catch (e) {
    if (e instanceof Error && e.message.includes('revoked')) {
      await prisma.user.update({ data: { revoked: true }, where: { id } });
      await prisma.queue.deleteMany({ where: { OR: [{ userId: id }, { ownerId: id }] } });
      await prisma.likedSongs.deleteMany({ where: { userId: id } });
    }

    // @ts-expect-error e is ResponseError
    if (e?.statusCode === 403) {
      await prisma.user.update({ data: { revoked: true }, where: { id } });
      // await prisma.queue.deleteMany({ where: { OR: [{ userId: id }, { ownerId: id }] } });
      // await prisma.likedSongs.deleteMany({ where: { userId: id } });
      // await prisma.recentSongs.deleteMany({ where: { userId: id } });
      // await prisma.recommendedSongs.deleteMany({
      //   where: { OR: [{ senderId: id }, { ownerId: id }] },
      // });
      // await prisma.aI.delete({ where: { userId: id } });
      // await prisma.settings.delete({ where: { userId: id } });
      // await prisma.profile.delete({ where: { userId: id } });
      // await prisma.user.delete({ where: { id } });
    }

    return { id, playback: null };
  }
};

export const removePlaybackJob = async (userId: string) => {
  // setting the jobId as userId limits a lot on ways to repeat the job with a dynamic delay
  // so we need to get all jobs and filter by userId
  const allJobs = await playbackQ.getJobs(['waiting', 'delayed']);
  const jobs = allJobs.filter((j) => j.data.userId === userId); // get generated jobId through job.data being the userId

  debugCreatorQ('playbackQ jobs', jobs.length);
  for (const job of jobs) {
    debugCreatorQ('playbackQ removing', job.id);
    await job.remove();
  }
};

export const clearDuplicatePlaybackJobs = async () => {
  const playbackQs = (await playbackQ.getDelayed()).map((j) => [j.name, j.data, j.delay] as const);
  debugCreatorQ('playbackQ active', playbackQs);

  if (!playbackQs.length) return;

  const playbackQIds = playbackQs.map(([, { userId }]) => userId);
  const hasDuplicateIds = new Set(playbackQIds).size !== playbackQIds.length;

  if (!hasDuplicateIds) return;
  debugCreatorQ('has duplicate playbackQs');

  const playbackQsMap = new Map<string, string>();
  for (const [name, data, delay] of playbackQs) {
    const userId = data?.userId;
    if (!userId) continue;
    const exists = playbackQsMap.get(userId);
    if (exists) return;
    playbackQsMap.set(userId, name);
    await removePlaybackJob(userId);
    await playbackQ.add(name, data, { delay, removeOnComplete: true, removeOnFail: true });
    debugCreatorQ('added new job', userId, delay);
  }

  debugCreatorQ('playbackQ active after clearing', await playbackQ.getDelayed());
};
