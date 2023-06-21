import invariant from 'tiny-invariant';

import { msToString, notNull } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { getAllUsersId } from '~/services/prisma/users.server';
import { getSpotifyClient } from '~/services/spotify.server';

import { Queue } from '../../queue.server';
import { playbackQ, upsertPlayback } from '../playback.server';

const getPlaybackState = async (id: string) => {
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

const removePlaybackJob = async (userId: string) => {
  // setting the jobId as userId limits a lot on ways to repeat the job with a dynamic delay
  // alternatively, it's possible to save the job id in the db
  const allJobs = await playbackQ.getJobs(['waiting', 'delayed']);
  const jobs = allJobs.filter((j) => j.data.userId === userId); // get generated jobId through job.data being the userId

  console.log('userQ -> playbackCreatorQ -> jobs', jobs.length);
  for (const job of jobs) {
    console.log('userQ -> playbackCreatorQ -> removing', job.id);
    await job.remove();
  }
};

export const playbackCreatorQ = Queue<null>('playback_creator', async (job) => {
  console.log('userQ -> playbackCreatorQ -> starting...');
  const users = await getAllUsersId();
  const playbacks = await Promise.all(users.map((userId) => getPlaybackState(userId)));
  const active = playbacks.filter((u) => notNull(u.playback));

  console.log(
    'userQ -> playbackCreatorQ -> users active',
    active.length,
    active.map(({ id }) => id).join(', '),
  );
  const playbackQs = (await playbackQ.getDelayed()).map((j) => [
    j.name,
    j.data,
    msToString(j.delay),
  ]);
  console.log('userQ -> playbackCreatorQ -> playbackQ active', playbackQs);

  for (const { id: userId, playback } of active) {
    if (!playback) continue;
    const { item: track, progress_ms, timestamp } = playback;
    const current = await prisma.playback.findUnique({ where: { userId } });
    const isSameTrack = current?.trackId === track?.id;
    if (isSameTrack) console.log('userQ -> playbackCreatorQ -> same track', userId);
    if (!track || track.type !== 'track' || !progress_ms || isSameTrack) continue;
    console.log('userQ -> playbackCreatorQ -> new track', userId);

    await upsertPlayback(userId, track, progress_ms, timestamp).catch((e) =>
      console.log('userQ -> playbackCreatorQ -> prisma update failed: ', e),
    );
    console.log('userQ -> playbackCreatorQ -> prisma updated');
    const remaining = track.duration_ms - progress_ms;
    await removePlaybackJob(userId);
    await playbackQ.add(
      'update_playback',
      { userId },
      { delay: remaining, removeOnComplete: true, removeOnFail: true },
    );
    console.log(
      'userQ -> playbackCreatorQ -> created playbackQ job with delay',
      msToString(remaining),
    );
    // queue pending (waiting for playback to start) songs from musy
    const queue = await prisma.queue.findMany({
      include: {
        track: { select: { uri: true } },
      },
      orderBy: { createdAt: 'asc' },
      where: { ownerId: userId, pending: true },
    });

    if (queue.length) {
      console.log('userQ -> playbackCreatorQ -> pending queue', queue.length);
      const { spotify } = await getSpotifyClient(userId);
      if (spotify) {
        for (const { track } of queue) {
          const { uri } = track;
          await spotify.addToQueue(uri);
          console.log('userQ -> playbackCreatorQ -> queued track', uri);
        }
        await prisma.queue.updateMany({
          data: { pending: false },
          where: { id: { in: queue.map((q) => q.id) } },
        });
        console.log('userQ -> playbackCreatorQ -> updated queues to not pending');
      }
    }
  }

  const inactive = playbacks.filter((u) => !notNull(u.playback));
  console.log('userQ -> playbackCreatorQ -> users inactive', inactive.length);

  for (const { id: userId } of inactive) {
    const playback = await prisma.playback.findUnique({ where: { userId } });
    if (playback) {
      console.log('userQ -> playbackCreatorQ -> playback exists for', userId);

      await removePlaybackJob(userId);
      console.log('userQ -> playbackCreatorQ -> removed playback');

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
          console.log(
            'userQ -> playbackCreatorQ -> less than 10 minutes between playbacks, updated endedAt',
          );
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
          console.log('userQ -> playbackCreatorQ -> created new playback history');
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
        console.log('userQ -> playbackCreatorQ -> created first playback history');
      }

      await prisma.playback.delete({ where: { userId } });
      console.log('userQ -> playbackCreatorQ -> deleted playback');
    }
  }
  console.log('userQ -> playbackCreatorQ -> completed');
});
