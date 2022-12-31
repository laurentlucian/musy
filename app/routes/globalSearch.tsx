import { getCurrentUser } from '~/services/auth.server';
import { spotifyApi } from '~/services/spotify.server';
import type { LoaderArgs } from '@remix-run/node';
import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

export const loader = async ({ request, params }: LoaderArgs) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  invariant(id, 'log in to search');

  const currentUser = await getCurrentUser(request);
  // const id = currentUser?.id

  const { spotify, user } = await spotifyApi(id);
  invariant(spotify, 'No access to spotify API');

  const searchURL = url.searchParams.get('spotify');
  if (!searchURL) return typedjson({ results: null, user: null, currentUser });

  const { body: results } = await spotify.searchTracks(searchURL);
  return typedjson({ results, user, currentUser });
};
