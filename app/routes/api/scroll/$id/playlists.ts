import type { LoaderArgs } from '@remix-run/server-runtime';

import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { spotifyApi } from '~/services/spotify.server';

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = params.id;

  if (typeof userId !== 'string') {
    return typedjson('Request Error');
  }

  const url = new URL(request.url);
  const offset = Number(url.searchParams.get('offset')) || 0;

  const { spotify } = await spotifyApi(userId);
  invariant(spotify, 'Missing spotify');

  const data = await spotify
    .getUserPlaylists('daniel.valdecantos', { limit: 50, offset })
    .then((res) => res.body.items.filter((data) => data.public && data.owner.id === userId))
    .catch(() => []);
  return typedjson(data);
};
