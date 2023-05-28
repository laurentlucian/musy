import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { typedjson } from 'remix-typedjson';

import { prisma } from '~/services/db.server';

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();
  const userId = body.get('userId');
  const currentUserId = body.get('currentUserId');
  const isNotBlocked = body.get('isNotBlocked');
  const blockId = body.get('blockId');

  if (
    typeof userId !== 'string' ||
    typeof currentUserId !== 'string' ||
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
    await prisma.follow.delete({ where: { userId_followId: { followId: currentUserId, userId } } });
    await prisma.follow.delete({
      where: { userId_followId: { followId: userId, userId: currentUserId } },
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
