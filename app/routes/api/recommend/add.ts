import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import type { Prisma } from '@prisma/client';
import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { createTrackModel } from '~/lib/utils';
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

export const action = async ({ request }: ActionArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const body = await request.formData();

  if (!session || !session.user) return typedjson('Unauthorized', { status: 401 });

  const { spotify } = await spotifyApi(session.user.id);
  invariant(spotify, 'No access to API');

  const trackId = body.get('trackId') as string;

  const { body: track } = await spotify.getTrack(trackId);
  const trackDb = createTrackModel(track);

  const data: Prisma.RecommendedCreateInput = {
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
        userId: session.user.id,
      },
    },
  };

  try {
    await prisma.recommended.create({ data });
  } catch (error) {
    console.log('recommend -> error', error);
    return typedjson('failed to add');
  }
  return typedjson('recommended');
};

export const loader = () => {
  throw json({}, { status: 404 });
};
