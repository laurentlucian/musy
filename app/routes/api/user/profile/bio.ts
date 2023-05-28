import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { prisma } from '~/services/db.server';
import { getCurrentUser } from '~/services/prisma/users.server';

export const action = async ({ request }: ActionArgs) => {
  const currentUser = await getCurrentUser(request);
  invariant(currentUser, 'No user found');
  const body = await request.formData();
  const bio = body.get('bio');

  if (typeof bio !== 'string' || !currentUser) {
    return typedjson('Request Error');
  }

  await prisma.profile.update({ data: { bio }, where: { userId: currentUser.userId } });
  return null;
};

export const loader = () => {
  throw json({}, { status: 404 });
};
