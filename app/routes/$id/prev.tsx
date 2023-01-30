import type { ActionFunction } from '@remix-run/node';

import invariant from 'tiny-invariant';

import { spotifyApi } from '~/services/spotify.server';

export const action: ActionFunction = async ({ params, request }) => {
  const id = params.id;
  invariant(id, 'Missing params Id');
  const { spotify } = await spotifyApi(id);
  invariant(spotify, 'Spotify is null');

  await spotify.skipToPrevious();
  return null;
};
