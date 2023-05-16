import type { ActionArgs } from '@remix-run/server-runtime';

import { typedjson } from 'remix-typedjson';

import { getCurrentUser } from '~/services/auth.server';
import { spotifyApi } from '~/services/spotify.server';

export const action = async ({ request }: ActionArgs) => {
  const data = await request.formData();
  const userId = data.get('userId');
  const trackId = data.get('trackId');
  const playlistId = data.get('playlistId');
  const currentUser = await getCurrentUser(request);

  if (
    typeof trackId !== 'string' ||
    typeof playlistId !== 'string' ||
    !currentUser ||
    typeof userId !== 'string'
  ) {
    return typedjson('Request Error');
  }

  const { spotify } = await spotifyApi(userId);
  if (!spotify) return typedjson('Error: no access to API');

  try {
    await spotify.addTracksToPlaylist(playlistId, [trackId]);
    return typedjson('Saved');
  } catch (error) {
    return typedjson('error: Reauthenticate');
  }
};
