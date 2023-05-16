import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import type { Prisma } from '@prisma/client';
import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { createTrackModel } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();
  const fromId = body.get('fromId');
  const toId = body.get('toId');

  if (typeof fromId !== 'string' || typeof toId !== 'string') return typedjson('invalid form data');

  const { spotify } = await spotifyApi(fromId);
  invariant(spotify, 'No access to API');

  const trackId = body.get('trackId') as string;
  const action = body.get('action') as string;

  const { body: track } = await spotify.getTrack(trackId);
  const trackDb = createTrackModel(track);

  const data: Prisma.RecommendedSongsCreateInput = {
    action,
    owner: {
      connect: {
        id: toId,
      },
    },
    sender: {
      connect: {
        userId: fromId,
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

  try {
    await prisma.recommendedSongs.create({ data });
  } catch (error) {
    console.log('recommend -> error', error);
    return typedjson('failed to send');
  }
  return typedjson('Recommended');
};

export const loader = () => {
  throw json({}, { status: 404 });
};
