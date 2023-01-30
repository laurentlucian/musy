import type { ActionArgs, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';

import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { createTrackModel } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

export const action = async ({ params, request }: ActionArgs) => {
  const { id } = params;
  if (!id) throw redirect('/');
  // const { spotify } = await spotifyApi(id);
  // invariant(spotify, 'No access to API');

  const body = await request.formData();
  const trackId = body.get('trackId') as string;

  // const { body: track } = await spotify.getTrack(trackId);
  // const trackDb = createTrackModel(track);

  const data = {
    profileSong: {
      connect: {
        id: trackId,
      },
    },
  };

  try {
    await prisma.settings.update({
      data,
      where: { userId: id },
    });
  } catch (error) {
    console.error(error);
    return 'Failed to add profile song';
  }
  return typedjson('Sent');
};

export const loader: LoaderFunction = () => {
  throw json({}, { status: 404 });
};
