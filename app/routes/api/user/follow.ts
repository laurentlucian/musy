import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { getSpotifyClient } from '~/services/spotify.server';

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();
  const userId = body.get('userId');
  const currentUserId = body.get('currentUserId');
  const follow = body.get('follow');

  if (
    typeof userId !== 'string' ||
    typeof currentUserId !== 'string' ||
    typeof follow !== 'string'
  ) {
    return typedjson('Bad Request');
  }

  if (follow === 'true') {
    const { spotify } = await getSpotifyClient(currentUserId);
    invariant(spotify, 'Spotify API Error');
    await spotify.followUsers([userId]);
  } else if (follow === 'false') {
    const { spotify } = await getSpotifyClient(currentUserId);
    invariant(spotify, 'Spotify API Error');
    await spotify.unfollowUsers([userId]);
  }
  return null;
};

export const loader = () => {
  throw json({}, { status: 404 });
};
