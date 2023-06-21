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
  const body = await request.formData();
  const currentUserId = await getCurrentUserId(request);
  const trackId = body.get('trackId');
  const toId = body.get('toId');

  const invalidFormData = typeof trackId !== 'string' || typeof toId !== 'string';

  if (invalidFormData) return typedjson('Request Error');

  const track = await getTrack(trackId).then(async (track) => {
    if (!track) {
      return createTrackModel(await getSpotifyTrack(trackId, currentUserId));
    }
    return track;
  });

  const playback = await prisma.playback.findUnique({
    where: {
      userId: toId,
    },
  });

  const data: Prisma.QueueCreateInput = {
    action: 'send',
    owner: {
      connect: {
        id: toId,
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
        userId: currentUserId,
      },
    },
  };

  if (playback) {
    try {
      const { spotify } = await getSpotifyClient(toId);
      if (!spotify) return typedjson('Error: no access to API');
      await spotify.addToQueue(track.uri);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        const details = err.stack?.split('Details:')[1];
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

  return typedjson('Sent');
};

export const loader = () => {
  throw json({}, { status: 404 });
};

export default () => null;
