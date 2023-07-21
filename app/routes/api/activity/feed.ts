import type { LoaderArgs } from '@remix-run/server-runtime';

import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { getFeed } from '~/services/prisma/tracks.server';
import { getCurrentUser } from '~/services/prisma/users.server';

export const loader = async ({ request }: LoaderArgs) => {
  const currentUser = await getCurrentUser(request);
  invariant(currentUser, 'No user found');
  const userId = currentUser.userId;
  const url = new URL(request.url);
  const limit = url.searchParams.get('limit');
  const offset = url.searchParams.get('offset');
  if (!limit || !offset) return typedjson([]);
  const feed = await getFeed(userId, Number(limit), Number(offset));

  return typedjson(feed);
};

export default () => null;
