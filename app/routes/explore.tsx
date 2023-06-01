import type { LoaderArgs } from '@remix-run/server-runtime';

import { Stack, Text } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import ProfileButton from '~/components/profile/ProfileButton';
import TrackTiles from '~/components/profile/tiles/TrackTiles';
import useFollowing from '~/hooks/useFollowing';
import { useRestOfUsers } from '~/hooks/useUsers';
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
        {results.users.map((user, index) => (
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
        {following.map((user, index) => (
          <ProfileButton key={user.userId} user={user} />
        ))}
        {following.length && (
          <Text pt="10px" fontSize="11px" fontWeight="bolder">
            EVERYONE
          </Text>
        )}
        {restOfUsers.map((user, index) => (
          <ProfileButton key={user.userId} user={user} />
        ))}
      </Stack>
    </Stack>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const currentUser = await getCurrentUser(request);
  invariant(currentUser, 'No user found');
  const userId = currentUser.userId;
  const [results, top] = await Promise.all([
    getSearchResults({ url: new URL(request.url), userId }),
    getTopLeaderboard(),
  ]);

  return typedjson({ results, top });
};
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export { CatchBoundary } from '~/components/error/CatchBoundary';
export default Explore;
