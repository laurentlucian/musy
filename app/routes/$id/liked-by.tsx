import type { LoaderArgs } from '@remix-run/server-runtime';
import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';
import { prisma } from '~/services/db.server';

export const loader = async ({ params }: LoaderArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const likedUsers = await prisma.profile.findMany({
    where: {
      liked: {
        some: {
          trackId: id,
        },
      },
    },
  });

  return typedjson(likedUsers);
};
