import type { LoaderFunctionArgs } from '@remix-run/server-runtime';

import { Stack, Text } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import ProfileButton from '~/components/profile/ProfileButton';
import TrackTiles from '~/components/tiles/TilesTrack';
import useFollowing from '~/hooks/useFollowing';
import { useRestOfUsers } from '~/hooks/useUsers';
import { getCacheControl } from '~/lib/utils';
import { getSearchResults } from '~/services/prisma/spotify.server';
import { getTopLeaderboard } from '~/services/prisma/tracks.server';
import { getCurrentUser } from '~/services/prisma/users.server';

const Explore = () => {
  const { results, top } = useTypedLoaderData<typeof loader>();
  const following = useFollowing();
  const restOfUsers = useRestOfUsers();

  if (results.tracks.length || results.users.length) {
    return (
      <Stack px={2}>
        <TrackTiles tracks={results.tracks} title="SONGS" />
        {results.users.length && (
          <Text pt="10px" fontSize="11px" fontWeight="bolder">
            USERS
          </Text>
        )}
        {results.users.map((user) => (
          <ProfileButton key={user.userId} user={user} />
        ))}
      </Stack>
    );
  }

  return (
    <Stack px={2}>
      <TrackTiles tracks={top} title="WEEKLY MOST LISTENED" />
      <Stack spacing={3} px={['4px', 'unset']} alignSelf="center" maxW="640px" w="100%">
        {following.length && (
          <Text pt="10px" fontSize="11px" fontWeight="bolder">
            FOLLOWING
          </Text>
        )}
        {following.map((user) => (
          <ProfileButton key={user.userId} user={user} />
        ))}
        {following.length && (
          <Text pt="10px" fontSize="11px" fontWeight="bolder">
            EVERYONE
          </Text>
        )}
        {restOfUsers.map((user) => (
          <ProfileButton key={user.userId} user={user} />
        ))}
      </Stack>
    </Stack>
  );
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const currentUser = await getCurrentUser(request);
  invariant(currentUser, 'No user found');
  const userId = currentUser.userId;
  const [results, top] = await Promise.all([
    getSearchResults({ param: 'keyword', url: new URL(request.url), userId }),
    getTopLeaderboard(),
  ]);

  return typedjson(
    { results, top },
    {
      headers: { ...getCacheControl() },
    },
  );
};
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default Explore;
