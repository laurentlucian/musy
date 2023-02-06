import type { ActionArgs, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';

import { typedjson } from 'remix-typedjson';

import { prisma } from '~/services/db.server';

export const action = async ({ params, request }: ActionArgs) => {
  const body = await request.formData();
  const trackId = body.get('trackId') as string;
  const rating = Number(body.get('rating'));

  try {
    await prisma.recommendedSongs.updateMany({
      data: {
        rating,
      },
      where: {
        trackId,
      },
    });
    console.log('rated the song', rating);
  } catch (error) {
    console.log('remove recommend -> error', error);
    return typedjson('failed to remove');
  }

  return typedjson('finished rating');
};

export const loader: LoaderFunction = () => {
  throw json({}, { status: 404 });
};
