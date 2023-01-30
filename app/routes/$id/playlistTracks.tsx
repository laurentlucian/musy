import type { LoaderArgs } from '@remix-run/server-runtime';

import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { spotifyApi } from '~/services/spotify.server';

export const loader = async ({ params, request }: LoaderArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const url = new URL(request.url);
  const playlistId = url.searchParams.get('playlistId');
  invariant(playlistId, 'no playlist detected');
  const offset = Number(url.searchParams.get('offset')) || 0;

  const { spotify } = await spotifyApi(id);
  invariant(spotify, 'Missing spotify');

  const fields = 'items';

  const data = await spotify
    .getPlaylistTracks(playlistId, { fields, limit: 50, offset })
    .then((data) => data.body.items)
    .catch(() => []);
  return typedjson(data);
};
