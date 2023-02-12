import type { ActionArgs } from '@remix-run/server-runtime';

import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { getCurrentUser } from '~/services/auth.server';
import { spotifyApi } from '~/services/spotify.server';

// export const loader = async ({ request, params }: LoaderArgs) => {
//   const id = params.id;
//   invariant(id, 'Missing params Id');

//   const url = new URL(request.url);
//   const trackId = url.searchParams.get('trackId');
//   if (!trackId) return;

//   const { spotify } = await spotifyApi(id);
//   invariant(spotify, 'Missing spotify');
//   return typedjson([true]);
// };

export const action = async ({ params, request }: ActionArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const data = await request.formData();
  const trackId = data.get('trackId');
  const playlistId = data.get('playlistId');
  const currentUser = await getCurrentUser(request);

  if (typeof trackId !== 'string' || typeof playlistId !== 'string' || !currentUser) {
    return typedjson('Request Error');
  }

  const { spotify } = await spotifyApi(id);
  if (!spotify) return typedjson('Error: no access to API');

  try {
    await spotify.addTracksToPlaylist(playlistId, [trackId]);
    return typedjson('Saved');
  } catch (error) {
    return typedjson('error: Reauthenticate');
  }
};
