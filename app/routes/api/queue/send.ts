import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import type { Prisma } from '@prisma/client';
import { typedjson } from 'remix-typedjson';

import { prisma } from '~/services/db.server';
import { createTrackModel } from '~/services/prisma/spotify.server';
import { getCurrentUserId } from '~/services/prisma/users.server';
import { getSpotifyClient } from '~/services/spotify.server';

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();
  const currentUserId = await getCurrentUserId(request);
  const trackId = body.get('trackId');
  const toId = body.get('toId');

  const invalidFormData = typeof trackId !== 'string' || typeof toId !== 'string';

  if (invalidFormData) return typedjson('Request Error');

  const { spotify } = await getSpotifyClient(toId);
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
        userId: currentUserId,
      },
    },
  };

  if (playback.is_playing) {
    try {
      await spotify.addToQueue(track.uri);
    } catch (err) {
      console.error(err);
      return typedjson('Error: Premium required');
    }

    try {
      await prisma.queue.create({ data });
    } catch (err) {
      console.error(err);
      return typedjson('Queued (Prisma Error)');
    }
  }

  return typedjson('Sent');
};

export const loader = () => {
  throw json({}, { status: 404 });
};
