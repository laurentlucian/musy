import type { LoaderFunctionArgs } from '@remix-run/server-runtime';

import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { getSearchResults } from '~/services/prisma/spotify.server';
import { getCurrentUser } from '~/services/prisma/users.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const currentUser = await getCurrentUser(request);
  invariant(currentUser, 'No user found');
  const userId = currentUser.userId;
  const url = new URL(request.url);
  const param = url.searchParams.get('param');
  if (!param) return typedjson({ tracks: [], users: [] });
  const { tracks, users } = await getSearchResults({
    param,
    url,
    userId,
  });

  return typedjson({ tracks, users });
};

export default () => null;
