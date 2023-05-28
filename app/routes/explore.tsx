import type { LoaderArgs } from '@remix-run/server-runtime';

import { Stack, Text } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import MiniPlayer from '~/components/profile/player/MiniPlayer';
import TrackTiles from '~/components/profile/tiles/TrackTiles';
import useFriends from '~/hooks/useFriends';
import { useRestOfUsers } from '~/hooks/useUsers';
import type { TrackWithInfo } from '~/lib/types/types';
import { getSearchResults } from '~/services/prisma/spotify.server';
import { getTopLeaderboard } from '~/services/prisma/tracks.server';
import { getCurrentUser } from '~/services/prisma/users.server';

const Explore = () => {
  const { results, top } = useTypedLoaderData<typeof loader>();
  const friends = useFriends();
  const restOfUsers = useRestOfUsers();

  const friendTracks = [] as TrackWithInfo[];
  for (const friend of friends) {
    if (!friend.playback) continue;
    friendTracks.push(friend.playback.track);
  }

  const everyoneTracks = [] as TrackWithInfo[];
  for (const user of restOfUsers) {
    if (!user.playback) continue;
    everyoneTracks.push(user.playback.track);
  }

  const userTracks = [] as TrackWithInfo[];
  for (const user of results.users) {
    if (!user.playback) continue;
    userTracks.push(user.playback.track);
  }

  if (results.tracks.length || results.users.length) {
    return (
      <Stack px={2}>
        <TrackTiles tracks={results.tracks} title="TRACKS" />
        {results.users.length && (
          <Text pt="10px" fontSize="11px" fontWeight="bolder">
            USERS
          </Text>
        )}
        {results.users.map((user, index) => (
          <MiniPlayer
            key={user.userId}
            layoutKey={'MiniPlayerF' + index}
            user={user}
            tracks={userTracks}
            index={index}
          />
        ))}
      </Stack>
    );
  }

  return (
    <Stack px={2}>
      <TrackTiles tracks={top} title="WEEKLY MOST LISTENED" />
      <Stack spacing={3} px={['4px', 'unset']}>
        {friends.length && (
          <Text pt="10px" fontSize="11px" fontWeight="bolder">
            FRIENDS
          </Text>
        )}
        {friends.map((user, index) => (
          <MiniPlayer
            key={user.userId}
            layoutKey={'MiniPlayerF' + index}
            user={user}
            tracks={friendTracks}
            index={index}
          />
        ))}
        {friends.length && (
          <Text pt="10px" fontSize="11px" fontWeight="bolder">
            EVERYONE
          </Text>
        )}
        {restOfUsers.map((user, index) => (
          <MiniPlayer
            key={user.userId}
            layoutKey={'MiniPlayerF' + index}
            user={user}
            tracks={everyoneTracks}
            index={index}
          />
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
