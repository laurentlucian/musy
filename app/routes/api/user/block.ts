import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { typedjson } from 'remix-typedjson';

import { prisma } from '~/services/db.server';
import { getCurrentUserId } from '~/services/prisma/users.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const currentUserId = await getCurrentUserId(request);
  const body = await request.formData();
  const userId = body.get('userId');
  const isNotBlocked = body.get('isNotBlocked');
  const blockId = body.get('blockId');

  if (
    typeof userId !== 'string' ||
    typeof blockId !== 'string' ||
    typeof isNotBlocked !== 'string'
  ) {
    return typedjson('Bad Request');
  }

  if (isNotBlocked === 'true') {
    await prisma.block.create({
      data: {
        blocked: {
          connect: { userId },
        },
        user: {
          connect: { userId: currentUserId },
        },
      },
    });
    await prisma.follow.delete({
      where: { followingId_followerId: { followerId: currentUserId, followingId: userId } },
    });
    await prisma.follow.delete({
      where: { followingId_followerId: { followerId: userId, followingId: currentUserId } },
    });
  } else if (isNotBlocked === 'false') {
    await prisma.block.delete({
      where: {
        id: Number(blockId),
      },
    });
  }
  return null;
};

export const loader = () => {
  throw json({}, { status: 404 });
};

export default () => null;
