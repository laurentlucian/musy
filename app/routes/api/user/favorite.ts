import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { typedjson } from 'remix-typedjson';

import { prisma } from '~/services/db.server';
import { getCurrentUserId } from '~/services/prisma/users.server';

export const action = async ({ request }: ActionArgs) => {
  const currentUserId = await getCurrentUserId(request);
  const body = await request.formData();
  const userId = body.get('userId');
  const isFavorited = body.get('isFavorited');

  if (typeof userId !== 'string' || typeof isFavorited !== 'string') {
    return typedjson('Bad Request');
  }

  if (isFavorited === 'true') {
    await prisma.favorite.create({
      data: {
        favorite: {
          connect: { userId },
        },
        user: {
          connect: { userId: currentUserId },
        },
      },
    });
  } else if (isFavorited === 'false') {
    await prisma.favorite.delete({
      where: { userId_favoriteId: { favoriteId: userId, userId: currentUserId } },
    });
  }
  return null;
};

export const loader = () => {
  throw json({}, { status: 404 });
};

export default () => null;
