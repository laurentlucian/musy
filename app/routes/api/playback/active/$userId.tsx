import type { LoaderArgs } from '@remix-run/server-runtime';

import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { prisma } from '~/services/db.server';
import { trackWithInfo } from '~/services/prisma/tracks.server';
import { getCurrentUser } from '~/services/prisma/users.server';

export const loader = async ({ params, request }: LoaderArgs) => {
  const currentUser = await getCurrentUser(request);
  invariant(currentUser, 'No user found');
  const userId = params.userId;
  invariant(userId, 'userId missing');

  const playback = await prisma.playback.findFirst({
    where: {
      userId,
    },
  });
  invariant(playback, 'No playback found');
  const recent = await prisma.recentSongs.findMany({
    include: {
      track: trackWithInfo,
    },
    orderBy: {
      playedAt: 'desc',
    },
    where: {
      playedAt: { gte: playback.createdAt },
      userId: userId,
    },
  });
  const tracks = recent.map((recent) => recent.track);
  return typedjson({ tracks });
};
