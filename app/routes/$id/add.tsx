import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params;
  if (!id) throw redirect('/');
  const data = await request.formData();
  const { track } = Object.fromEntries(data);
  const uri = track.valueOf() as string;
  const image = data.get('image');
  const trackName = data.get('trackName');
  const artist = data.get('artist');
  const explicit = Boolean(data.get('explicit'));

  if (
    typeof image !== 'string' ||
    typeof trackName !== 'string' ||
    typeof artist !== 'string' ||
    typeof explicit !== 'boolean'
  ) {
    throw new Error(`Form not submitted correctly.`);
  }

  const fields = { trackName, image, artist, explicit, ownerId: id };

  const { spotify } = await spotifyApi(id);
  if (!spotify) return json('No access to spotify API', { status: 500 });

  try {
    await spotify.addToQueue(uri);
    // syncronizing with prisma only if spotify.api is successful
    await prisma.queue.create({ data: fields });
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
