import type { ActionArgs } from '@remix-run/node';

import { Stack, Text } from '@chakra-ui/react';

import MiniPlayer from '~/components/profile/player/MiniPlayer';
import useFriends from '~/hooks/useFriends';
import useSessionUser from '~/hooks/useSessionUser';
import { useRestOfUsers } from '~/hooks/useUsers';
import type { TrackWithInfo } from '~/lib/types/types';
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

const Friends = () => {
  const currentUser = useSessionUser();
  const friends = useFriends();
  const restOfUsers = useRestOfUsers();

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
    <Stack spacing={3} px={['4px', 'unset']} overflowX="hidden">
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
  );
};

export const action = async ({ request }: ActionArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const currentUserId = session?.user?.id;

  if (!currentUserId) return null;

  const data = await request.formData();
  const friendId = data.get('friendId');
  const clickStatus = data.get('clickStatus');

  if (typeof friendId === 'string') {
    if (clickStatus === 'accepted') {
      await prisma.friend.create({
        data: {
          friendId: currentUserId,
          userId: friendId,
        },
      });

      await prisma.friend.create({
        data: {
          friendId,
          userId: currentUserId,
        },
      });
    } else if (clickStatus === 'rejected') {
      await prisma.friend.delete({
        where: {
          userId_friendId: {
            friendId: currentUserId,
            userId: friendId,
          },
        },
      });
    }
  }

  return null;
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export { CatchBoundary } from '~/components/error/CatchBoundary';
export default Friends;
