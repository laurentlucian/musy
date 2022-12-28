import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { prisma } from '~/services/db.server';
import { activityQ } from '~/services/scheduler/jobs/activity';
import { spotifyApi } from '~/services/spotify.server';

export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params;
  if (!id) throw redirect('/');
  const body = await request.formData();
  const trackId = body.get('trackId');
  const fromUserId = body.get('fromId');
  const action = body.get('action') as string;

  if (typeof trackId !== 'string' || typeof fromUserId !== 'string') {
    return json('Request Error');
  }
  const { spotify } = await spotifyApi(id);
  if (!spotify) return json('Error: no access to API');

  const {
    body: {
      uri,
      name,
      album: {
        images: [{ url: image }],
        name: albumName,
        uri: albumUri,
      },
      artists: [{ uri: artistUri, name: artist }],
      explicit,
    },
  } = await spotify.getTrack(trackId);

  const fields = {
    trackId,
    uri,
    name,
    image,
    albumUri,
    albumName,
    artist,
    artistUri,
    explicit,
    ownerId: id,
    userId: fromUserId !== '' ? fromUserId : null,
    action,
  };

  const { body: playback } = await spotify.getMyCurrentPlaybackState();
  const isPlaying = playback.is_playing;

  if (isPlaying) {
    try {
      await spotify.addToQueue(uri);
      if (id !== fromUserId) {
        await prisma.queue.create({ data: fields });
      }
      return json('Queued');
    } catch (error) {
      console.log('add -> error', error);
      return json('Error: Premium required');
    }
  }

  if (id !== fromUserId) {
    const activity = await prisma.queue.create({
      data: { ...fields, pending: true },
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
    return json('Will queue once play resumes');
  } else {
    console.log(id, fromUserId);
    // not adding to Activity when user queues song from their own page
    return json('Error: resume play first');
  }
};

export const loader: LoaderFunction = () => {
  throw json({}, { status: 404 });
};
