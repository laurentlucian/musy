import type { LoaderArgs } from '@remix-run/server-runtime';
import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';
import { spotifyApi } from '~/services/spotify.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const url = new URL(request.url);
  const offset = Number(url.searchParams.get('offset')) || 0;

  const { spotify } = await spotifyApi(id);
  invariant(spotify, 'Missing spotify');

  const data = await spotify
    .getUserPlaylists({ offset, limit: 50 })
    .then((res) => res.body.items.filter((data) => data.public && data.owner.id === id));
  return typedjson(data);
  // throw typedjson({}, { status: 404 });
};
