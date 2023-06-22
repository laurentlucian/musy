import { minutesToMs, msToString, notNull } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { getAllUsersId } from '~/services/prisma/users.server';
import { getSpotifyClient } from '~/services/spotify.server';

import { Queue } from '../../queue.server';
import { debugCreatorQ, playbackQ } from '../playback.server';
import {
  clearDuplicatePlaybackJobs,
  getPlaybackState,
  removePlaybackJob,
  upsertPlayback,
} from './utils.server';

export const createPlaybackQ = async () => {
  debugCreatorQ('starting...');

  const users = await getAllUsersId();
  const playbacks = await Promise.all(users.map((userId) => getPlaybackState(userId)));
  const active = playbacks.filter((u) => notNull(u.playback));

  debugCreatorQ('users active', active.length, active.map(({ id }) => id).join(', '));
  await clearDuplicatePlaybackJobs();

  for (const { id: userId, playback } of active) {
    if (!playback) continue;
    const { item: track, progress_ms } = playback;
    const current = await prisma.playback.findUnique({ where: { userId } });
    const isSameTrack = current?.trackId === track?.id;
    if (isSameTrack) debugCreatorQ('same track', userId);
    if (!track || track.type !== 'track' || !progress_ms || isSameTrack) continue;
    debugCreatorQ('new track', userId);

    await upsertPlayback(userId, playback).catch((e) => debugCreatorQ('prisma update failed: ', e));
    debugCreatorQ('prisma updated');
    const remaining = track.duration_ms - progress_ms;
    await removePlaybackJob(userId);
    await playbackQ.add(
      'update_playback',
      { userId },
      { delay: remaining, removeOnComplete: true, removeOnFail: true },
    );
    debugCreatorQ('created playbackQ job with delay', msToString(remaining));
    // queue pending (waiting for playback to start) songs from musy
    const queue = await prisma.queue.findMany({
      include: {
        track: { select: { uri: true } },
      },
      orderBy: { createdAt: 'asc' },
      where: { ownerId: userId, pending: true },
    });

    if (queue.length) {
      debugCreatorQ('pending queue', queue.length);
      const { spotify } = await getSpotifyClient(userId);
      if (spotify) {
        for (const { track } of queue) {
          const { uri } = track;
          await spotify.addToQueue(uri);
          debugCreatorQ('queued track', uri);
        }
        await prisma.queue.updateMany({
          data: { pending: false },
          where: { id: { in: queue.map((q) => q.id) } },
        });
        debugCreatorQ('updated queues to not pending');
      }
    }
  }

  const inactive = playbacks.filter((u) => !notNull(u.playback));
  debugCreatorQ('users inactive', inactive.length);

  for (const { id: userId } of inactive) {
    const playback = await prisma.playback.findUnique({ where: { userId } });
    if (playback) {
      debugCreatorQ('playback exists for', userId);

      await removePlaybackJob(userId);
      debugCreatorQ('removed playback');

      const recentHistory = await prisma.playbackHistory.findFirst({
        orderBy: { endedAt: 'desc' },
        where: { userId },
      });

      if (recentHistory) {
        const { endedAt } = recentHistory;
        const now = new Date();
        const diff = playback.createdAt.getTime() - endedAt.getTime();
        const diffMinutes = Math.floor(diff / 1000 / 60);

        if (diffMinutes < 10) {
          await prisma.playbackHistory.update({
            data: { endedAt: now },
            where: { id: recentHistory.id },
          });
          debugCreatorQ('less than 10 minutes between playbacks, updated endedAt');
        } else {
          await prisma.playbackHistory.create({
            data: {
              startedAt: playback.createdAt,
              user: {
                connect: {
                  userId,
                },
              },
            },
          });
          debugCreatorQ('created new playback history');
        }
      } else {
        await prisma.playbackHistory.create({
          data: {
            startedAt: playback.createdAt,
            user: {
              connect: {
                userId,
              },
            },
          },
        });
        debugCreatorQ('created first playback history');
      }

      await prisma.playback.delete({ where: { userId } });
      debugCreatorQ('deleted playback');
    }
  }
  debugCreatorQ('completed');
};

export const playbackCreator = Queue<null>(
  'playback_creator',
  async () => {
    return;
  },
  {
    limiter: {
      duration: minutesToMs(0.5),
      max: 1,
    },
  },
);
