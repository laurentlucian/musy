import type { ActionFunction } from '@remix-run/node';
import type { LoaderArgs } from '@remix-run/server-runtime';
import { typedjson } from 'remix-typedjson';
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
  // throw typedjson({}, { status: 404 });
};

export const action: ActionFunction = async ({ request, params }) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const data = await request.formData();
  const trackId = data.get('trackId');
  const currentUser = await getCurrentUser(request);

  if (typeof trackId !== 'string' || !currentUser) {
    return typedjson('Request Error');
  }

  const { spotify } = await spotifyApi(id);
  if (!spotify) return typedjson('Error: no access to API');

  const [isSaved] = await getSavedStatus(id, trackId);
  if (isSaved) return typedjson('Already saved');

  try {
    await spotify.addToMySavedTracks([trackId]);
    return typedjson('Saved');
  } catch (error) {
    return typedjson('error: Reauthenticate');
  }

  // @todo implement getSavedStatus before calling this action

  // if (isRemovable === true)
  //   try {
  //     await spotify.removeFromMySavedTracks([trackId]);
  //   } catch (error) {
  //     console.log('add -> error', error);
  //     return typedjson('Error: Premium required');
  //   }
  // else {
  //   try {
  //     await spotify.addToMySavedTracks([trackId]);
  //     return typedjson('Saved');
  //   } catch (error) {
  //     console.log('add -> error', error);
  //     return typedjson('Error: Premium required');
  //   }
  // }
};
