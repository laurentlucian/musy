import type { LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { spotifyApi } from '~/services/spotify.server';

export const action: LoaderFunction = async ({ request, params }) => {
  const { id } = params;
  if (!id) throw redirect('/');
  const data = await request.formData();
  const { track } = Object.fromEntries(data);
  const uri = track.valueOf() as string;

  const { spotify } = await spotifyApi(id);
  if (!spotify) return json('No access to spotify API', { status: 500 });

  try {
    await spotify.addToQueue(uri);
  } catch {
    // @todo handle errors gracefully
    // tell user when queue didn't work (can't queue when user isn't playing)
    // if (res.statusCode !== 204) return json("Couldn't add to queue", { status: res.statusCode });
    return null;
  }

  return null;
};

export const loader: LoaderFunction = () => {
  throw json({}, { status: 404 });
};
