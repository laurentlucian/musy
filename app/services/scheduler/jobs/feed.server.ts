import debug from 'debug';

import { prisma } from '~/services/db.server';

import { Queue } from '../queue.server';
const debugFeedQ = debug('feedQ');

export const feedQ = Queue<null>('update_feed', async () => {
  debugFeedQ('feedQ starting...');

  const [liked, queue, recommended] = await Promise.all([
    prisma.likedSongs.findMany({
      where: {
        feedId: null,
      },
    }),
    prisma.queue.findMany({
      where: {
        AND: {
          action: 'send',
          feedId: null,
        },
      },
    }),
    prisma.recommended.findMany({
      where: {
        feedId: null,
      },
    }),
  ]);

  debugFeedQ('adding liked', liked.length);
  for (const item of liked) {
    await prisma.feed.create({
      data: {
        createdAt: item.createdAt,
        liked: {
          connect: {
            id: item.id,
          },
        },
        user: {
          connect: {
            userId: item.userId,
          },
        },
      },
    });
  }

  debugFeedQ('adding queue', queue.length);
  for (const item of queue) {
    await prisma.feed.create({
      data: {
        createdAt: item.createdAt,
        queue: {
          connect: {
            id: item.id,
          },
        },
        user: {
          connect: {
            userId: item.ownerId,
          },
        },
      },
    });
  }

  debugFeedQ('adding recommended', recommended.length);
  for (const item of recommended) {
    await prisma.feed.create({
      data: {
        createdAt: item.createdAt,
        recommend: {
          connect: {
            id: item.id,
          },
        },
        user: {
          connect: {
            userId: item.userId,
          },
        },
      },
    });
  }

  debugFeedQ('completed');
});
