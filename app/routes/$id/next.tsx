import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import invariant from 'tiny-invariant';

import { spotifyApi } from '~/services/spotify.server';

export const action = async ({ params }: ActionArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');
  const { spotify } = await spotifyApi(id);
  invariant(spotify, 'Spotify is null');

  await spotify.skipToNext();
  return null;
};

export const loader = () => {
  throw json({}, { status: 404 });
};
