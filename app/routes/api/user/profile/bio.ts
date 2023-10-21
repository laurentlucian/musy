import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { typedjson } from 'remix-typedjson';

import { prisma } from '~/services/db.server';
import { getCurrentUserId } from '~/services/prisma/users.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const currentUserId = await getCurrentUserId(request);
  const body = await request.formData();
  const bio = body.get('bio');

  if (typeof bio !== 'string') {
    return typedjson('Request Error');
  }

  await prisma.profile.update({ data: { bio }, where: { userId: currentUserId } });
  return null;
};

export const loader = () => {
  throw json({}, { status: 404 });
};

export default () => null;
