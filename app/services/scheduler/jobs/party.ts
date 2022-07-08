import { prisma } from '~/services/db.server';
import { Queue, registeredQueues } from '~/services/scheduler/queue.server';
import { spotifyApi } from '~/services/spotify.server';

// - get all existing parties
// - delete related parties if owner has paused @todo only after 10 minutes of pause
// - delete unique party if listener has paused
// - get currentTrack of existing owners' party
// - adds currentTrack to queue of listeners

// @todo check all active parties and create ownerQ jobs if doesn't exist (should never happen)
// @todo implement sentry to alert when error happens

// registeredQueues['queue_track']?.worker.on('completed', (job) => {
//   console.log('listenerQ.on -> job complete', job.data);
// });
// registeredQueues['queue_track']?.worker.on('failed', (job) => {
//   console.log('listenerQ.on -> job failed', job.data);
// });
// registeredQueues['update_track']?.worker.on('completed', (job) => {
//   console.log('ownerQ.on -> job complete', job.data);
// });
// registeredQueues['update_track']?.worker.on('failed', (job) => {
//   console.log('ownerQ.on -> job failed', job.data);
// });

export const listenerQ = Queue<{
  userId: string;
  currentTrack: string;
  repeat: 'track' | 'context' | 'off';
}>('queue_track', async (job) => {
  console.log('listenerQ -> starting...');
  const { userId, currentTrack, repeat } = job.data;

  try {
    const { spotify } = await spotifyApi(userId);
    if (!spotify) {
      console.log('listenerQ -> failed: spotify null');
      throw 'spotifyApi null';
    }
    const { body: playback } = await spotify.getMyCurrentPlaybackState();
    if (playback.repeat_state !== repeat) {
      spotify.setRepeat(repeat);
    }

    if (!playback.is_playing) {
      console.log('listenerQ -> listener has paused playback; removing from party');
      await prisma.party.delete({ where: { userId } });
      throw 'listener has paused playback; removing from party';
    }

    await spotify.addToQueue(currentTrack);
    console.log('listenerQ -> success: added owner currentTrack to listener queue', currentTrack);
    return null;
  } catch {
    console.log('listenerQ -> caught an error');
    throw 'caught an error';
  }
});

export const ownerQ = Queue<{ ownerId: string; userId: string }>('update_track', async (job) => {
  console.log('ownerQ update_track job starting...');
  const { ownerId } = job.data;

  try {
    const parties = await prisma.party.findMany({ where: { ownerId: ownerId } });
    if (parties.length === 0) {
      console.log('ownerQ -> failed: no active parties');
      const jobKey = job.repeatJobKey;
      if (jobKey) {
        await ownerQ.removeRepeatableByKey(jobKey);
        console.log('ownerQ -> removed repeatable job');
      }
      return 'ownerQ -> no active parties';
    }

    const { spotify } = await spotifyApi(ownerId);
    if (!spotify) {
      console.log('ownerQ -> no spotify API');
      return 'ownerQ -> no spotify API';
    }

    const { body: playback } = await spotify.getMyCurrentPlaybackState();

    if (!playback.is_playing) {
      console.log('ownerQ -> failed: owner has paused playback');
      await prisma.party.deleteMany({ where: { ownerId } });
      const jobKey = job.repeatJobKey;
      if (jobKey) {
        await ownerQ.removeRepeatableByKey(jobKey);
      }
      return 'owner has paused playback -> deleted all parties by owner';
    }

    const currentTrack = playback.item?.uri ?? '';
    // const percentage = playback.item?.duration_ms && playback?.progress_ms ? (playback.progress_ms / playback.item.duration_ms) * 100 : 0;
    if (currentTrack !== parties[0].currentTrack) {
      await prisma.party.updateMany({
        where: { ownerId: ownerId },
        data: {
          currentTrack,
        },
      });
      console.log('ownerQ -> old uri - new uri', parties[0].currentTrack, currentTrack);
      console.log('ownerQ -> updated currentTrack', playback.item?.name);

      listenerQ.addBulk(
        parties.map((party) => ({
          name: 'queue_track',
          data: {
            currentTrack: currentTrack,
            userId: party.userId,
            repeat: playback.repeat_state,
          },
        })),
      );
      console.log('ownerQ -> added all listeners jobs');
    } else {
      console.log('ownerQ -> currentTrack is the same');
    }

    return null;
  } catch {
    console.log('ownerQ -> caught an error');
    throw 'ownerQ -> caught an error!';
  }
});

const startUp = async () => {
  console.log('startUp -> starting...');
  const parties = await prisma.party.findMany();
  console.log('startUp -> parties..', parties);
  console.log('startUp -> queues..', await registeredQueues['update_track']?.queue.getJobCounts());

  ownerQ.addBulk(
    parties.map((party) => ({
      name: 'queue_track',
      data: {
        ownerId: party.ownerId,
        userId: party.userId,
      },
    })),
  );
  console.log('startUp -> done');
};

// startUp();
