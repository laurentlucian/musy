import type { ActionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';

import { typedjson } from 'remix-typedjson';

import { prisma } from '~/services/db.server';

export const action = async ({ params, request }: ActionArgs) => {
  const { id } = params;
  if (!id) throw redirect('/');

  const body = await request.formData();
  const trackId = body.get('trackId') as string;

  const data = {
    profileSong: {
      connect: {
        id: trackId,
      },
    },
  };

  try {
    await prisma.settings.update({
      data,
      where: { userId: id },
    });
  } catch (error) {
    console.error(error);
    return 'Failed to add profile song';
  }
  return typedjson('Sent');
};

export const loader = () => {
  throw json({}, { status: 404 });
};
