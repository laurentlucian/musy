import type { ActionArgs } from '@remix-run/server-runtime';

import { typedjson } from 'remix-typedjson';

import { getSpotifyClient } from '~/services/spotify.server';

export const action = async ({ request }: ActionArgs) => {
  const data = await request.formData();
  const userId = data.get('userId');
  const trackId = data.get('trackId');
  const playlistId = data.get('playlistId');

  if (typeof trackId !== 'string' || typeof playlistId !== 'string' || typeof userId !== 'string') {
    return typedjson('Request Error');
  }

  const { spotify } = await getSpotifyClient(userId);
  if (!spotify) return typedjson('Error: no access to API');

  try {
    await spotify.addTracksToPlaylist(playlistId, [trackId]);
    return typedjson('Saved');
  } catch (error) {
    return typedjson('error: Reauthenticate');
  }
};
