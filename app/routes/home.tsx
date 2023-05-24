import { Stack, Text, useColorModeValue } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import ActivityTile from '~/components/home/activity/ActivityTile';
import MiniPlayer from '~/components/profile/player/MiniPlayer';
import Tiles from '~/components/profile/tiles/Tiles';
import useFriends from '~/hooks/useFriends';
import useSessionUser from '~/hooks/useSessionUser';
import { useRestOfUsers } from '~/hooks/useUsers';
import type { TrackWithInfo } from '~/lib/types/types';
import { getActivity } from '~/services/prisma/tracks.server';

const Index = () => {
  const currentUser = useSessionUser();
  const friends = useFriends();
  const restOfUsers = useRestOfUsers();
  const { activities } = useTypedLoaderData<typeof loader>();
  const bg = useColorModeValue('#EEE6E2', '#050404');

  const activityTracks = [] as TrackWithInfo[];
  for (const activity of activities) {
    if (!activity.track) continue;
    activityTracks.push(activity.track);
  }

  const friendTracks = [] as TrackWithInfo[];
  for (const friend of friends) {
    if (!friend.playback || !friend.playback) continue;
    friendTracks.push(friend.playback.track);
  }

  const everyoneTracks = [] as TrackWithInfo[];
  for (const user of restOfUsers) {
    if (!user.playback || !user.playback) continue;
    everyoneTracks.push(user.playback.track);
  }

  return (
    <Stack pb="50px" pt={{ base: '15px', xl: 0 }} bg={bg} h="100%">
      <Stack px={['5px', 0]}>
        <Tiles spacing="15px" autoScroll={currentUser?.settings?.autoscroll ?? false}>
          {activities.map((activity, index) => {
            return (
              <ActivityTile
                key={activity.id}
                layoutKey={'mActivity' + index}
                activity={activity}
                tracks={activityTracks}
                index={index}
              />
            );
          })}
        </Tiles>
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
            currentUserId={currentUser?.userId}
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
            currentUserId={currentUser?.userId}
            tracks={everyoneTracks}
            index={index}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export const loader = async () => {
  const activities = await getActivity();

  return typedjson({
    activities,
  });
};

export default Index;

export { CatchBoundary } from '~/components/error/CatchBoundary';
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
