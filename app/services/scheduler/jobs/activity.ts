import { prisma } from '~/services/db.server';
import { Queue } from '~/services/scheduler/queue.server';
import { spotifyApi } from '~/services/spotify.server';

export const activityQ = Queue<{ activityId: number }>('pending_activity', async (job) => {
  console.log('activityQ -> pending job starting...');
  const { activityId } = job.data;
  const pendingTrack = await prisma.queue.findUnique({ where: { id: activityId } });
  const isPending = pendingTrack?.pending === true;

  try {
    if (isPending) {
      const { spotify } = await spotifyApi(pendingTrack.ownerId);
      if (spotify) {
        console.log('activityQ -> sending to spotify...');
        await spotify.addToQueue(pendingTrack.uri);
        await prisma.queue.update({ where: { id: activityId }, data: { pending: false } });
        const jobKey = job.repeatJobKey;
        if (jobKey) {
          await activityQ.removeRepeatableByKey(jobKey);
        }
        console.log('activityQ -> sent; terminating...');
      }
    } else {
      console.log('activityQ -> not pending, terminating... (shouldnt be possible)');
      const jobKey = job.repeatJobKey;
      if (jobKey) {
        await activityQ.removeRepeatableByKey(jobKey);
      }
    }

    return null;
  } catch {
    console.log('activityQ -> not able to send to spotify; will try again');
    throw 'activityQ -> caught an error!';
  }
});
