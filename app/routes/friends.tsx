import type { ActionArgs, LoaderArgs } from '@remix-run/node';

import { Stack } from '@chakra-ui/react';

import type { Track } from '@prisma/client';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import MiniPlayer from '~/components/profile/player/MiniPlayer';
import useSessionUser from '~/hooks/useSessionUser';
import type { TrackWithInfo } from '~/lib/types/types';
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { getFavorites, getFriends, getPending } from '~/services/prisma/users.server';

const Friends = () => {
  const { favs, friends } = useTypedLoaderData<typeof loader>();
  const currentUser = useSessionUser();

  const friendsList =
    friends?.sort(({ friend }, { friend: prevFriend }) => {
      if (prevFriend.playback !== null && friend.playback === null) return 0;
      return favs?.some(({ favorite }) => favorite.userId === friend.userId) ? -1 : 1;
    }) ?? [];

  const friendTracks = [] as TrackWithInfo[];
  for (const friend of friendsList) {
    if (!friend.friend.playback || !friend.friend.playback) continue;
    friendTracks.push(friend.friend.playback.track);
  }

  return (
    <Stack pt={['50px', 'unset']} h="50vh" spacing={3} w="100%" px={['4px', 'unset']}>
      {friendsList?.map(({ friend }, index) => {
        return (
          <MiniPlayer
            key={friend.userId}
            layoutKey={'MiniPlayerF' + index}
            user={friend}
            currentUserId={currentUser?.userId}
            tracks={friendTracks}
            index={index}
          />
        );
      })}
    </Stack>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const currentUserId = session?.user?.id;

  const [friends, favs, pendingFriends] = await Promise.all([
    getFriends(currentUserId),
    getFavorites(currentUserId),
    getPending(currentUserId),
  ]);

  return typedjson({
    currentUserId,
    favs,
    friends,
    pendingFriends,
  });
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
