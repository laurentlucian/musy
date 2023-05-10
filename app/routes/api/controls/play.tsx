import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import invariant from 'tiny-invariant';

import { spotifyApi } from '~/services/spotify.server';

export const action = async ({ request }: ActionArgs) => {
  const data = await request.formData();
  const userId = data.get('userId') as string;
  const { spotify } = await spotifyApi(userId);
  invariant(spotify, 'Spotify is null');

  await spotify.play();
  return null;
};

export const loader = () => {
  throw json({}, { status: 404 });
};
