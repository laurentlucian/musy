import type { LoaderArgs } from '@remix-run/server-runtime';
import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';
import { spotifyApi } from '~/services/spotify.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const url = new URL(request.url);
  const time_range = (url.searchParams.get('top-filter') ?? 'medium_term') as
    | 'medium_term'
    | 'long_term'
    | 'short_term';

  const { spotify } = await spotifyApi(id);
  invariant(spotify, 'Missing spotify');
  const { body } = await spotify.getMyTopTracks({ time_range, limit: 50 });
  const data = body.items ?? [];
  return typedjson(data);
  // throw typedjson({}, { status: 404 });
};