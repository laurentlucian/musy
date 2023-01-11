import type { ActionArgs, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { typedjson } from 'remix-typedjson';
import { createTrackModel } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { activityQ } from '~/services/scheduler/jobs/activity';
import { spotifyApi } from '~/services/spotify.server';

export const action = async ({ request, params }: ActionArgs) => {
  const { id } = params;
  if (!id) throw redirect('/');
  const body = await request.formData();
  const trackId = body.get('trackId');
  const fromUserId = body.get('fromId');
  const action = body.get('action') as string;

  if (typeof trackId !== 'string' || typeof fromUserId !== 'string') {
    return typedjson('Request Error');
  }
  const { spotify } = await spotifyApi(id);
  if (!spotify) return typedjson('Error: no access to API');

  const { body: track } = await spotify.getTrack(trackId);
  const trackDb = createTrackModel(track);

  const data = {
    uri: track.uri,
    name: track.name,
    image: track.album.images[0].url,
    albumUri: track.album.uri,
    albumName: track.album.name,
    artist: track.artists[0].name,
    artistUri: track.artists[0].uri,
    explicit: track.explicit,
    action,

    user: {
      connect: {
        userId: fromUserId,
      },
    },
    owner: {
      connect: {
        id,
      },
    },

    track: {
      connectOrCreate: {
        create: trackDb,
        where: {
          id: track.id,
        },
      },
    },
  };

  const { body: playback } = await spotify.getMyCurrentPlaybackState();
  const isPlaying = playback.is_playing;

  if (isPlaying) {
    try {
      await spotify.addToQueue(track.uri);
      if (id !== fromUserId) {
        await prisma.queue.create({ data });
      }
      return typedjson('Queued');
    } catch (error) {
      console.log('add -> error', error);
      return typedjson('Error: Premium required');
    }
  }

  if (id !== fromUserId) {
    const activity = await prisma.queue.create({
      data: { ...data, pending: true },
    });
    const res = await activityQ.add(
      'pending_activity',
      {
        activityId: activity.id,
      },
      {
        repeat: {
          every: 30000,
        },
        jobId: String(activity.id),
      },
    );
    console.log('add -> created Job on ', res.queueName);
    // tell user when queue didn't work (can't queue when user isn't playing)
    return typedjson('Queued');
  } else {
    console.log(id, fromUserId);
    // not adding to Activity when user queues song from their own page
    return typedjson('Error: Play first');
  }
};

export const loader: LoaderFunction = () => {
  throw json({}, { status: 404 });
};
