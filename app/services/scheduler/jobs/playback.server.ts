import type { Prisma } from '@prisma/client';

import { msToString } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { createTrackModel } from '~/services/prisma/spotify.server';
import { Queue } from '~/services/scheduler/queue.server';
import { getSpotifyClient } from '~/services/spotify.server';

export const playbackQ = Queue<{ userId: string }>('update_playback', async (job) => {
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
      'update_playback',
      { userId },
      {
        delay: 1000 * 60 * 5,
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

  const extraDelay = isSameTrack ? 1000 * 5 : 1000 * 1;
  const delay = remaining + extraDelay;
  await playbackQ.add(
    'update_playback',
    { userId },
    {
      delay,
      removeOnComplete: true,
      removeOnFail: true,
    },
  );

  console.log('playbackQ -> completed', userId, 'will check again in', msToString(delay));
});

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
