import invariant from 'tiny-invariant';
import { createTrackModel, notNull } from '~/lib/utils';
import { getAllUsers } from '~/services/auth.server';
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

  console.log('playbackQ -> prisma updated', userId);
};

export const playbackQ = Queue<{ userId: string }>('playback', async (job) => {
  const { userId } = job.data;

  console.log('playbackQ -> job starting...', userId);
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    include: { user: true },
  });

  const { spotify } = await spotifyApi(userId);

  if (!profile || !profile.user || !spotify) {
    console.log(`playbackQ ${userId} removed -> user not found`);
    return null;
  }

  const { body: playback } = await spotify.getMyCurrentPlaybackState();
  if (!playback || !playback.is_playing) {
    console.log('playbackQ -> not playing', userId);
    return null;
  }
  const { item: track, progress_ms } = playback;

  if (!track || track.type !== 'track' || !progress_ms) {
    console.log('playbackQ -> not playing a track', userId);
    return null;
  }

  const current = await prisma.playback.findUnique({ where: { userId } });
  const isSameTrack = current?.trackId === track.id;

  console.log('playbackQ -> user', userId, 'track', track.name);
  await upsertPlayback(userId, track, progress_ms, playback.timestamp);

  console.log('playbackQ -> completed', userId);
  const remaining = track.duration_ms - progress_ms;
  await playbackQ.add(
    'playback',
    { userId },
    { delay: remaining + (isSameTrack ? 2000 : 500), removeOnComplete: true, removeOnFail: true },
  );
  // return playback;
});

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

    // @ts-expect-error e is ResponseError
    if (e?.statusCode === 403) {
      await prisma.user.update({ where: { id }, data: { revoked: true } });
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

  console.log('removePlaybackJob -> jobs', jobs.length);
  for (const job of jobs) {
    console.log('removePlaybackJob -> removing', job.id);
    await job.remove();
  }
};

export const playbackCreator = async () => {
  const users = await getAllUsers();
  const playbacks = await Promise.all(users.map((user) => getPlaybackState(user.userId)));
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
    if (isSameTrack) console.log('playbackCreator -> same track', track?.name, userId);
    if (!track || track.type !== 'track' || !progress_ms || isSameTrack) continue;
    console.log('playbackCreator -> new track', track?.name, userId);

    await upsertPlayback(userId, track, progress_ms, timestamp).catch((e) => console.log(e));
    const remaining = track.duration_ms - progress_ms;
    await removePlaybackJob(userId);
    await playbackQ.add('playback', { userId }, { delay: remaining, removeOnComplete: true });
  }

  const inactive = playbacks.filter((u) => !notNull(u.playback));
  console.log('playbackCreator -> users inactive', inactive.length);

  for (const { id: userId } of inactive) {
    const exists = await prisma.playback.findUnique({ where: { userId } });
    if (exists) {
      await removePlaybackJob(userId);
      await prisma.playback.delete({ where: { userId } });
      console.log('playbackCreator -> deleted', userId, 'playback');
    }
  }
};
