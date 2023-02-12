import type { ActionArgs, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import type { Prisma } from '@prisma/client';
import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { createTrackModel } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

export const action = async ({ params, request }: ActionArgs) => {
  const { id } = params;
  if (!id) throw redirect('/');
  const { spotify } = await spotifyApi(id);
  invariant(spotify, 'No access to API');

  const body = await request.formData();
  const trackId = body.get('trackId') as string;
  const fromUserId = body.get('fromId') as string;
  const action = body.get('action') as string;

  const { body: track } = await spotify.getTrack(trackId);
  const trackDb = createTrackModel(track);

  const data: Prisma.RecommendedSongsCreateInput = {
    action,
    owner: {
      connect: {
        id,
      },
    },
    sender: {
      connect: {
        userId: fromUserId,
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

  if (id !== fromUserId) {
    try {
      await prisma.recommendedSongs.create({ data });
    } catch (error) {
      console.log('recommend -> error', error);
      return typedjson('failed to send');
    }
    return typedjson('sent');
  } else {
    return typedjson('why are you recommending to yourself');
  }
};

export const loader: LoaderFunction = () => {
  throw json({}, { status: 404 });
};
