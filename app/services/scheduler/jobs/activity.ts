import { prisma } from '~/services/db.server';
import { Queue } from '~/services/scheduler/queue.server';
import { spotifyApi } from '~/services/spotify.server';

export const activityQ = Queue<{ activityId: number }>('pending_activity', async (job) => {
  console.log('activityQ -> pending job starting...');
  const { activityId } = job.data;
  const pendingTrack = await prisma.queue.findUnique({ where: { id: activityId } });
  if (!pendingTrack) {
    console.log('activityQ -> activity doesnt exist (shouldnt be possible)');
    return null;
  }

  if (!pendingTrack.pending) {
    const jobKey = job.repeatJobKey;
    if (jobKey) {
      await activityQ.removeRepeatableByKey(jobKey);
      console.log('activityQ -> not pending, removed job (shouldnt be possible)');
      return null;
    }
    console.log('activityQ -> not pending and couldnt remove job (missing jobKey)');
  }

  const removeJob = async () => {
    const jobKey = job.repeatJobKey;
    if (jobKey) {
      await activityQ.removeRepeatableByKey(jobKey);
      console.log('activityQ -> removed job');
      return null;
    }
    console.log('activityQ -> couldnt remove job (missing jobKey)');
    throw Error('couldnt remove job (missing jobKey)');
  };

  try {
    const { spotify } = await spotifyApi(pendingTrack.ownerId);
    if (!spotify) return null;

    const { body: playback } = await spotify.getMyCurrentPlaybackState();
    const isPlaying = playback.is_playing;

    if (!isPlaying) {
      console.log('activityQ -> user not playing yet; will try again in 30 seconds');
      return null;
    }

    try {
      console.log('activityQ -> sending to spotify...');
      await spotify.addToQueue(pendingTrack.uri);
      console.log('activityQ -> sent to spotify...');
      await prisma.queue.update({ data: { pending: false }, where: { id: activityId } });
      await removeJob();
    } catch (error) {
      console.log('activityQ -> addToQueue error; when account not premium');
      await removeJob();
      return null;
    }
  } catch (e) {
    console.log('activityQ -> not able to get playback state', e);
    await removeJob();
    return null;
  }
});

const isDev = process.env.NODE_ENV !== 'production';

export const clearActivityQOnDev = async () => {
  if (!isDev) return;
  await activityQ.obliterate();
};
