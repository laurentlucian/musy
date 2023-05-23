import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import invariant from 'tiny-invariant';

import { getSpotifyClient } from '~/services/spotify.server';

export const action = async ({ request }: ActionArgs) => {
  const data = await request.formData();
  const userId = data.get('userId') as string;
  const { spotify } = await getSpotifyClient(userId);
  invariant(spotify, 'Spotify is null');

  await spotify.skipToPrevious();
  return null;
};

export const loader = () => {
  throw json({}, { status: 404 });
};
