import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import type { Prisma } from '@prisma/client';
import { typedjson } from 'remix-typedjson';

import { createTrackModel } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { activityQ } from '~/services/scheduler/jobs/activity.server';
import { spotifyApi } from '~/services/spotify.server';

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();
  const trackId = body.get('trackId');
  const fromId = body.get('fromId');
  const toId = body.get('toId');

  const invalidFormData =
    typeof trackId !== 'string' || typeof toId !== 'string' || typeof fromId !== 'string';

  if (invalidFormData) return typedjson('Request Error');

  const { spotify } = await spotifyApi(toId);
  if (!spotify) return typedjson('Error: no access to API');

  const { body: track } = await spotify.getTrack(trackId);
  const trackDb = createTrackModel(track);

  const { body: playback } = await spotify.getMyCurrentPlaybackState();

  const data: Prisma.QueueCreateInput = {
    action: 'send',
    owner: {
      connect: {
        id: toId,
      },
    },

    pending: !playback.is_playing,

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
        userId: fromId,
      },
    },
  };

  if (playback.is_playing) {
    try {
      await Promise.all([spotify.addToQueue(track.uri), prisma.queue.create({ data })]);
      return typedjson('Queued');
    } catch (error) {
      console.log('send -> error', error);
      return typedjson('Error: Premium required');
    }
  }

  const activity = await prisma.queue.create({ data });
  const res = await activityQ.add(
    'pending_activity',
    { activityId: activity.id },
    {
      jobId: String(activity.id),
      removeOnComplete: true,
      removeOnFail: true,
      repeat: {
        every: 30000,
      },
    },
  );
  console.log('add -> created Job on ', res.queueName);
  return typedjson('Queued');
};

export const loader = () => {
  throw json({}, { status: 404 });
};
