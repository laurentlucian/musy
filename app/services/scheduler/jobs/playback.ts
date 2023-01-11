import invariant from 'tiny-invariant';
import { createTrackModel, minutesToMs, notNull } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { Queue } from '~/services/scheduler/queue.server';
import { spotifyApi } from '~/services/spotify.server';

const upsertPlayback = async (
  userId: string,
  track: SpotifyApi.TrackObjectFull,
  progress: number,
  timestamp: number,
) => {
  const trackDb = createTrackModel(track);
  const data = {
    updatedAt: timestamp,
    progress,
  };

  await prisma.playback.upsert({
    where: {
      userId,
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
  });

  const remaining = track.duration_ms - progress;
  const jobId = `${userId}/${remaining}`;
  await playbackQ.add('playback', { userId }, { jobId, delay: remaining, removeOnComplete: true });
  console.log('playbackQ -> prisma & job created', userId);
};

export const playbackQ = Queue<{ userId: string }>(
  'playback',
  async (job) => {
    const { userId } = job.data;
    const removeJob = async () => {
      const jobKey = job.repeatJobKey;
      if (jobKey) {
        await playbackQ.removeRepeatableByKey(jobKey);
      }
      await prisma.playback.delete({ where: { userId } });
      console.log(`playbackQ ${userId} removed`);
    };

    console.log('playbackQ -> pending job starting...', userId);
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      include: { user: true },
    });

    const { spotify } = await spotifyApi(userId);

    if (!profile || !profile.user || !spotify) {
      console.log(`playbackQ ${userId} removed -> user not found`);
      await removeJob();
      return null;
    }

    const { body: playback } = await spotify.getMyCurrentPlaybackState();
    if (!playback) {
      console.log('playbackQ -> not playing', userId);
      return null;
    }
    const { item: track, progress_ms } = playback;

    if (!track || track.type !== 'track' || !progress_ms || !playback.is_playing) {
      console.log('playbackQ -> playing a podcast/episode', userId);
      await removeJob();
      return null;
    }

    console.log('playbackQ -> user', userId, 'track', track.name);
    await upsertPlayback(userId, track, progress_ms, playback.timestamp);
    console.log('playbackQ -> completed', userId);
  },
  {
    limiter: {
      max: 2,
      duration: minutesToMs(0.5),
    },
  },
);

const getPlaybackState = async (id: string) => {
  try {
    const { spotify } = await spotifyApi(id);
    invariant(spotify, 'Spotify API not found');
    const { body: playback } = await spotify.getMyCurrentPlaybackState();
    const { item, is_playing } = playback;
    if (!is_playing || !item || item.type !== 'track') return { id, playback: null };
    return { id, playback };
  } catch (e) {
    if (e instanceof Error && e.message.includes('revoked')) {
      await prisma.user.update({ where: { id }, data: { revoked: true } });
      await prisma.queue.deleteMany({ where: { OR: [{ userId: id }, { ownerId: id }] } });
      await prisma.likedSongs.deleteMany({ where: { userId: id } });
    }

    return { id, playback: null };
  }
};

export const playbackCreatorQ = Queue<null>('playback_creator', async (job) => {
  const users = await prisma.profile.findMany();
  console.log(
    'playbackCreatorQ -> users without playback record',
    users.map((u) => u.userId).join(', '),
  );

  const playbacks = await Promise.all(users.map((user) => getPlaybackState(user.userId)));
  const active = playbacks.filter((u) => notNull(u.playback));

  console.log(
    'playbackCreatorQ -> users active',
    active.length,
    active.map(({ id }) => id).join(', '),
  );
  // const cleaned = await playbackQ.clean(0, 0, 'delayed');
  // const cleaned1 = await playbackQ.clean(0, 0, 'active');
  // await prisma.playback.deleteMany();
  // console.log('playbackCreatorQ -> users cleaned', cleaned, cleaned1);

  for (const { id: userId, playback } of active) {
    console.log('playbackCreatorQ -> user', userId, 'playback', playback?.item?.name);
    if (!playback) continue;
    const { item: track, progress_ms, timestamp } = playback;
    const current = await prisma.playback.findUnique({ where: { userId } });
    const isSameTrack = current?.trackId === track?.id;
    if (isSameTrack) console.log('playbackCreatorQ -> same track', userId, track?.name);
    console.log('playbackCreatorQ -> new track', userId, track?.name);
    if (!track || track.type !== 'track' || !progress_ms || isSameTrack) continue;

    await upsertPlayback(userId, track, progress_ms, timestamp).catch((e) => console.log(e));
  }

  const inactive = playbacks.filter((u) => !notNull(u.playback));
  console.log(
    'playbackCreatorQ -> users inactive',
    inactive.length,
    inactive.map(({ id }) => id).join(', '),
  );
  for (const { id: userId } of inactive) {
    const exists = await prisma.playback.findUnique({ where: { userId } });
    if (exists) {
      await prisma.playback.delete({ where: { userId } });
      console.log('playbackCreatorQ -> deleted', userId, 'playback');
    }
  }
});
