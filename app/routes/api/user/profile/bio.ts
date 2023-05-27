import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { typedjson } from 'remix-typedjson';

import { prisma } from '~/services/db.server';

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();
  const id = body.get('userId');
  const bio = body.get('bio');

  if (typeof bio !== 'string' || typeof id !== 'string') {
    return typedjson('Request Error');
  }

  await prisma.profile.update({ data: { bio }, where: { userId: id } });
  return null;
};

export const loader = () => {
  throw json({}, { status: 404 });
};
