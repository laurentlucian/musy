import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import type { Prisma } from '@prisma/client';
import { typedjson } from 'remix-typedjson';

import { prisma } from '~/services/db.server';
import { createTrackModel, getSpotifyTrack } from '~/services/prisma/spotify.server';
import { getTrack } from '~/services/prisma/tracks.server';
import { getCurrentUserId } from '~/services/prisma/users.server';
import { getSpotifyClient } from '~/services/spotify.server';

export const action = async ({ request }: ActionArgs) => {
  const currentUserId = await getCurrentUserId(request);
  const body = await request.formData();
  const fromId = body.get('fromId');
  const trackId = body.get('trackId');

  const invalidFormData = typeof trackId !== 'string' || typeof fromId !== 'string';

  if (invalidFormData) return typedjson('Request Error');

  const track = await getTrack(trackId).then(async (track) => {
    if (!track) {
      return createTrackModel(await getSpotifyTrack(trackId, currentUserId));
    }
    return track;
  });
  const playback = await prisma.playback.findUnique({
    where: {
      userId: currentUserId,
    },
  });

  const data: Prisma.QueueCreateInput = {
    action: 'add',
    owner: {
      connect: {
        id: currentUserId,
      },
    },

    track: {
      connectOrCreate: {
        create: track,
        where: {
          id: track.id,
        },
      },
    },

    user: {
      connect: {
        userId: fromId || currentUserId,
      },
    },
  };

  if (playback) {
    try {
      const { spotify } = await getSpotifyClient(currentUserId);
      if (!spotify) return typedjson('Error: no access to API');
      await spotify.addToQueue(track.uri);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        const details = err.message.split('Details: ')[1].split('.')[0];

        return typedjson('Error: ' + details);
      }
      return typedjson('Error: Premium required');
    }

    try {
      await prisma.queue.create({ data });
    } catch (err) {
      console.error(err);
      return typedjson('Queued (Prisma Error)');
    }
  } else {
    await prisma.queue.create({ data: { pending: true, ...data } });
  }

  return typedjson('Queued');
};

export const loader = () => {
  throw json({}, { status: 404 });
};
