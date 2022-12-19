import type { ActionFunction } from '@remix-run/node';
import type { LoaderArgs } from '@remix-run/server-runtime';
import { typedjson } from 'remix-typedjson';
import { json } from 'remix-utils';
import invariant from 'tiny-invariant';
import { getCurrentUser } from '~/services/auth.server';
import { getSavedStatus, spotifyApi } from '~/services/spotify.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const url = new URL(request.url);
  const trackId = url.searchParams.get('trackId');
  if (!trackId) return;

  const { spotify } = await spotifyApi(id);
  invariant(spotify, 'Missing spotify');
  // const body = await getSavedStatus(id, trackId);
  return typedjson([true]);
  // throw json({}, { status: 404 });
};

export const action: ActionFunction = async ({ request, params }) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const data = await request.formData();
  const trackId = data.get('trackId');
  const isRemovable = Boolean(data.get('isRemovable'));
  const currentUser = await getCurrentUser(request);

  if (typeof trackId !== 'string' || typeof isRemovable !== 'boolean') {
    return json('Request Error');
  }

  const { spotify } = await spotifyApi(id);
  if (!spotify) return json('Error: no access to API');

  if (currentUser) {
    if (isRemovable === true)
      try {
        await spotify.removeFromMySavedTracks([trackId]);
      } catch (error) {
        console.log('add -> error', error);
        return json('Error: Premium required');
      }
    else {
      try {
        await spotify.addToMySavedTracks([trackId]);
        return json('Saved');
      } catch (error) {
        console.log('add -> error', error);
        return json('Error: Premium required');
      }
    }
  }
};
