import type { ActionArgs, LoaderFunction } from '@remix-run/node';
import { spotifyApi } from '~/services/spotify.server';
import { createTrackModel } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { typedjson } from 'remix-typedjson';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

export const action = async ({ request, params }: ActionArgs) => {
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
      where: { userId: id },
      data,
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
