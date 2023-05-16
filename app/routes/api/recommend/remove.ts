import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { typedjson } from 'remix-typedjson';

import { prisma } from '~/services/db.server';

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();
  const trackId = body.get('trackId') as string;

  try {
    await prisma.recommendedSongs.updateMany({
      data: {
        action: 'history',
      },
      where: {
        trackId,
      },
    });
  } catch (error) {
    console.log('remove recommend -> error', error);
    return typedjson('failed to remove');
  }

  return typedjson('removed');
};

export const loader = () => {
  throw json({}, { status: 404 });
};
