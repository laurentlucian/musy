import type { ActionArgs, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { typedjson } from 'remix-typedjson';
import { prisma } from '~/services/db.server';

export const action = async ({ request, params }: ActionArgs) => {
  const { id } = params;
  if (!id) throw redirect('/');
  const body = await request.formData();
  const trackId = body.get('trackId') as string;
  const fromUserId = body.get('fromId') as string;
  const action = body.get('action') as string;
  const uri = body.get('uri') as string;
  const name = body.get('name') as string;
  const image = body.get('image') as string;
  const albumUri = body.get('albumUri') as string;
  const albumName = body.get('albumName') as string;
  const artist = body.get('artist') as string;
  const artistUri = body.get('artistUri') as string;
  const explicit = body.get('explicit') as string;

  const data = {
    ownerId: id,
    trackId,
    uri,
    name,
    image,
    albumUri,
    albumName,
    artist,
    artistUri,
    explicit: explicit ? true : false,
    senderId: fromUserId,
    action,
  };

  if (id !== fromUserId) {
    try {
      await prisma.recommendedSongs.create({ data: data });
    } catch (error) {
      console.log('recommend -> error', error);
      return typedjson('failed to send');
    }
    return typedjson('Sent');
  }
};

export const loader: LoaderFunction = () => {
  throw json({}, { status: 404 });
};
