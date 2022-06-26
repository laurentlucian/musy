import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params;
  if (!id) throw redirect('/');
  const data = await request.formData();
  const uri = data.get('uri');
  const image = data.get('image');
  const name = data.get('name');
  const artist = data.get('artist');
  const explicit = Boolean(data.get('explicit'));

  if (
    typeof uri !== 'string' ||
    typeof image !== 'string' ||
    typeof name !== 'string' ||
    typeof artist !== 'string' ||
    typeof explicit !== 'boolean'
  ) {
    return json('Form submitted incorrectly', { status: 403 });
  }

  const fields = { uri, name, image, artist, explicit, ownerId: id };

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
