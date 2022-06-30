import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params;
  if (!id) throw redirect('/');
  const body = await request.formData();
  const uri = body.get('uri');
  const image = body.get('image');
  const name = body.get('name');
  const artist = body.get('artist');
  const explicit = Boolean(body.get('explicit'));
  const fromUserId = body.get('fromId');

  if (
    typeof uri !== 'string' ||
    typeof image !== 'string' ||
    typeof name !== 'string' ||
    typeof artist !== 'string' ||
    typeof explicit !== 'boolean' ||
    typeof fromUserId !== 'string'
  ) {
    return json('Form submitted incorrectly');
  }

  const fields = {
    uri,
    name,
    image,
    artist,
    explicit,
    ownerId: id,
    userId: fromUserId,
  };

  const { spotify } = await spotifyApi(id);
  if (!spotify) return json('Error');

  try {
    console.log('added to spotify');
    await spotify.addToQueue(uri);
    // syncronizing with prisma only after spotify.api is successful
    // @todo use scheduler to send to spotify when user starts listening
    if (id !== fromUserId) {
      // and only if currentUser is adding from someone's else page
      console.log('added to prisma');
      await prisma.queue.create({ data: fields });
    }
    return json(null);
  } catch {
    // tell user when queue didn't work (can't queue when user isn't playing)
    return json('Error');
  }
};

export const loader: LoaderFunction = () => {
  throw json({}, { status: 404 });
};
