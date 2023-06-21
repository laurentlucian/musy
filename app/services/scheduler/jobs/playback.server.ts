import type { Prisma } from '@prisma/client';
import invariant from 'tiny-invariant';

import { msToString, notNull, secondsToMinutes } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { createTrackModel } from '~/services/prisma/spotify.server';
import { getAllUsersId } from '~/services/prisma/users.server';
import { Queue } from '~/services/scheduler/queue.server';
import { getSpotifyClient } from '~/services/spotify.server';

export const playbackQ = Queue<{ userId: string }>('playback', async (job) => {
  const { userId } = job.data;
  console.log('playbackQ -> job starting...', userId);

  const { spotify } = await getSpotifyClient(userId);

  if (!spotify) {
    console.log(`playbackQ -> exiting; spotify client not found`);
    return null;
  }

  const { body: playback } = await spotify.getMyCurrentPlaybackState();

  if (!playback || !playback.is_playing) {
    console.log('playbackQ -> exiting; user not playing, will be cleaned up on playbackCreator');
    return null;
  }
  const { item: track, progress_ms } = playback;

  if (!track || track.type !== 'track' || !progress_ms) {
    console.log(
      'playbackQ -> exiting; user not playing a track, will be cleaned up on playbackCreator',
    );
    return null;
  }

  console.log('playbackQ -> repeat state', playback.repeat_state);
  if (playback.repeat_state === 'track') {
    console.log('playbackQ -> on repeat -- will check again in 5 minutes', track.name, userId); // figure out why playbackQ spams with isSameTrack --
    await playbackQ.add(
      'playback',
      { userId },
      {
        delay: 1000 * 60 * 60 * 5,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
    console.log('playbackQ -> completed', userId);
    return null;
  }
  const current = await prisma.playback.findUnique({ where: { userId } });
  const isSameTrack = current?.trackId === track.id;

  const remaining = track.duration_ms - progress_ms;

  console.log('playbackQ ->', track.name, isSameTrack ? '' : 'newTrack');

  await upsertPlayback(userId, track, progress_ms, playback.timestamp);
  console.log('playbackQ -> prisma updated');

  const extraDelay = isSameTrack ? 1000 * 60 : 1000 * 60 * 5;
  const delay = remaining + extraDelay;
  await playbackQ.add(
    'playback',
    { userId },
    {
      delay,
      removeOnComplete: true,
      removeOnFail: true,
    },
  );

  console.log('playbackQ -> completed', userId, 'will check again in', msToString(delay));
});

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

  console.log('playbackCreator -> jobs', jobs.length);
  for (const job of jobs) {
    console.log('playbackCreator -> removing', job.id);
    await job.remove();
  }
};

export const playbackCreator = async () => {
  const users = await getAllUsersId();
  const playbacks = await Promise.all(users.map((userId) => getPlaybackState(userId)));
  const active = playbacks.filter((u) => notNull(u.playback));

  console.log(
    'playbackCreator -> users active',
    active.length,
    active.map(({ id }) => id).join(', '),
  );

  for (const { id: userId, playback } of active) {
    if (!playback) continue;
    const { item: track, progress_ms, timestamp } = playback;
    const current = await prisma.playback.findUnique({ where: { userId } });
    const isSameTrack = current?.trackId === track?.id;
    if (isSameTrack) console.log('playbackCreator -> same track', userId);
    if (!track || track.type !== 'track' || !progress_ms || isSameTrack) continue;
    console.log('playbackCreator -> new track', userId);

    await upsertPlayback(userId, track, progress_ms, timestamp).catch((e) =>
      console.log('playbackCreator -> prisma update failed: ', e),
    );
    console.log('playbackCreator -> prisma updated');
    const remaining = track.duration_ms - progress_ms;
    await removePlaybackJob(userId);
    await playbackQ.add(
      'playback',
      { userId },
      { delay: remaining, removeOnComplete: true, removeOnFail: true },
    );
    console.log('playbackCreator -> created playbackQ job with delay', msToString(remaining));
    // queue pending (waiting for playback to start) songs from musy
    const queue = await prisma.queue.findMany({
      include: {
        track: { select: { uri: true } },
      },
      orderBy: { createdAt: 'asc' },
      where: { ownerId: userId, pending: true },
    });

    if (queue.length) {
      console.log('playbackCreator -> pending queue', queue.length);
      const { spotify } = await getSpotifyClient(userId);
      if (spotify) {
        for (const { track } of queue) {
          const { uri } = track;
          await spotify.addToQueue(uri);
          console.log('playbackCreator -> queued track', uri);
        }
        await prisma.queue.updateMany({
          data: { pending: false },
          where: { id: { in: queue.map((q) => q.id) } },
        });
        console.log('playbackCreator -> updated queues to not pending');
      }
    }
  }

  const inactive = playbacks.filter((u) => !notNull(u.playback));
  console.log('playbackCreator -> users inactive', inactive.length);

  for (const { id: userId } of inactive) {
    const playback = await prisma.playback.findUnique({ where: { userId } });
    if (playback) {
      console.log('playbackCreator -> playback exists for', userId);

      await removePlaybackJob(userId);
      console.log('playbackCreator -> removed playback');

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
          console.log('playbackCreator -> less than 10 minutes between playbacks, updated endedAt');
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
          console.log('playbackCreator -> created new playback history');
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
        console.log('playbackCreator -> created first playback history');
      }

      await prisma.playback.delete({ where: { userId } });
      console.log('playbackCreator -> deleted playback');
    }
  }
  console.log('playbackCreator -> completed');
};

export const upsertPlayback = async (
  userId: string,
  track: SpotifyApi.TrackObjectFull,
  progress: number,
  timestamp: number,
) => {
  const trackDb = createTrackModel(track);
  const data = {
    progress,
    timestamp,
  };

  await prisma.playback.upsert({
    create: {
      ...data,
      track: {
        connectOrCreate: {
          create: trackDb,
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
    },
    update: {
      ...data,
      track: {
        connectOrCreate: {
          create: trackDb,
          where: {
            id: track.id,
          },
        },
      },
    },
    where: {
      userId,
    },
  });

  const endedAt = new Date(timestamp + track.duration_ms);

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
          create: trackDb,
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
