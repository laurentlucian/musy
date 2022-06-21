import { prisma } from '~/services/db.server';
import { Queue } from '~/services/scheduler/queue.server';
import { spotifyApi } from '~/services/spotify.server';

// - get all existing parties
// - delete related parties if owner has stopped
// - delete unique party if listener has stopped
// - get currentTrack of existing owners' party
// - adds currentTrack to queue of listeners

// @todo check all active parties and create ownerQ jobs if doesn't exist
// in case of edge cases? what if ownerQ fails and doesn't readd itself to queue?

export const listenerQ = Queue<{ userId: string; currentTrack: string }>(
  'queue_track',
  async (job) => {
    console.log('listenerQ -> starting...');
    const { userId, currentTrack } = job.data;

    try {
      const { spotify } = await spotifyApi(userId);
      if (!spotify) {
        console.log('listenerQ -> failed: spotify null');
        return null;
      }
      const { body: playback } = await spotify.getMyCurrentPlaybackState();
      if (!playback.is_playing) {
        console.log('listenerQ -> listener has paused playback; removing from party');
        await prisma.party.delete({ where: { userId } });
        return null;
      }

      await spotify.addToQueue(currentTrack);
      console.log('listenerQ -> success: added owner currentTrack to listener queue', currentTrack);
    } catch {
      console.log('listenerQ -> caught an error');
      return null;
    }
  },
);

export const ownerQ = Queue<{ ownerId: string; userId: string }>('update_track', async (job) => {
  console.log('OwnerQ update_track job starting...');
  const { ownerId, userId } = job.data;

  try {
    const parties = await prisma.party.findMany({ where: { ownerId: ownerId } });
    if (parties.length === 0) {
      console.log('ownerQ -> failed: no active parties');
      return null;
    }

    const { spotify } = await spotifyApi(ownerId);
    if (!spotify) {
      console.log('ownerQ -> no spotify API from owner');
      return null;
    }

    const { body: playback } = await spotify.getMyCurrentPlaybackState();
    if (!playback.is_playing) {
      console.log('ownerQ -> failed: owner has paused playback');
      return null;
    }

    const currentTrack = playback.item?.uri;
    await prisma.party.updateMany({
      where: { ownerId: ownerId },
      data: {
        currentTrack,
      },
    });
    console.log('OwnerQ -> updated currentTrack', playback.item?.name);

    listenerQ.addBulk(
      parties.map((party) => ({
        name: 'queue_track',
        data: {
          currentTrack: party.currentTrack,
          userId: party.userId,
        },
      })),
    );
    console.log('OwnerQ -> added all listeners jobs');

    if (!playback.item) {
      console.log('ownerQ -> failed: no duration_ms');
      return null;
    }

    // @todo handle owner skipping songs
    const res = await ownerQ.add(
      'update_track',
      {
        ownerId,
        userId,
      },
      // would it ignore new job if jobId is the same as the one calling it?
      {
        delay: playback.item.duration_ms,
        jobId: ownerId,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    console.log('OwnerQ -> next update_track job with', playback.item.duration_ms, 'ms delay', res);
    return null;
  } catch {
    console.log('ownerQ -> caught an error!');
    return null;
  }
});
