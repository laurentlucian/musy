import type { LoaderArgs } from '@remix-run/server-runtime';
import { spotifyApi } from '~/services/spotify.server';
import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

export const loader = async ({ request, params }: LoaderArgs) => {
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
    .getPlaylistTracks(playlistId, { offset, limit: 50, fields })
    .then((data) => data.body.items)
    .catch(() => []);
  return typedjson(data);
};
