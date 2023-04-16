import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { useRevalidator } from '@remix-run/react';
import { useEffect } from 'react';

import { Box, Stack } from '@chakra-ui/react';

import type { Track } from '@prisma/client';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import PrismaMiniPlayer from '~/components/player/home/PrismaMiniPlayer';
import { useRevalidatorStore } from '~/hooks/useRevalidatorStore';
import useSessionUser from '~/hooks/useSessionUser';
import useVisibilityChange from '~/hooks/useVisibilityChange';
import type { FriendCard } from '~/lib/types/types';
import { authenticator, getAllUsers, getFavorites, getFriends } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

const Friends = () => {
  const { currentUserId, favs, friends, users } = useTypedLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  const currentUser = useSessionUser();
  const shouldRevalidate = useRevalidatorStore((state) => state.shouldRevalidate);

  const sort = (array: FriendCard[]) => {
    return array.sort((a, b) => {
      if (!!b.playback?.updatedAt && !a.playback?.updatedAt) {
        return 1;
      } else if (!!a.playback?.updatedAt && !b.playback?.updatedAt) {
        return -1;
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
  };

  let sortedFriends = sort(friends);
  const favorites = sort(favs);

  sortedFriends = sortedFriends.filter((friend) => {
    return !favorites.some((favorite) => favorite.userId === friend.userId);
  });

  const currentUserData = users.filter((user) => user.userId === currentUserId)[0];

  useVisibilityChange((isVisible) => isVisible === true && !shouldRevalidate && revalidate());

  useEffect(() => {
    if (shouldRevalidate) {
      console.log('shouldRevalidate', shouldRevalidate);
      // revalidate();
    }
  }, [shouldRevalidate, revalidate]);

  const friendsTracks: Track[] = [];
  for (let i = 0; i < sortedFriends.length; i++) {
    if (sortedFriends[i].playback === null || sortedFriends[i].playback?.track === undefined) {
      continue;
    }
    const track = {
      albumName: sortedFriends[i].playback!.track.albumName,
      albumUri: sortedFriends[i].playback!.track.albumUri,
      artist: sortedFriends[i].playback!.track.artist,
      artistUri: sortedFriends[i].playback!.track.artistUri,
      duration: sortedFriends[i].playback!.track.duration,
      explicit: sortedFriends[i].playback!.track.explicit,
      id: sortedFriends[i].playback!.track.id,
      image: sortedFriends[i].playback!.track.image,
      link: sortedFriends[i].playback!.track.link,
      name: sortedFriends[i].playback!.track.name,
      preview_url: sortedFriends[i].playback!.track.preview_url,
      uri: sortedFriends[i].playback!.track.uri,
    };
    friendsTracks.push(track);
  }
  const favsTracks: Track[] = [];
  for (let i = 0; i < sortedFriends.length; i++) {
    if (sortedFriends[i].playback === null || sortedFriends[i].playback?.track === undefined) {
      continue;
    }
    const track = {
      albumName: sortedFriends[i].playback!.track.albumName,
      albumUri: sortedFriends[i].playback!.track.albumUri,
      artist: sortedFriends[i].playback!.track.artist,
      artistUri: sortedFriends[i].playback!.track.artistUri,
      duration: sortedFriends[i].playback!.track.duration,
      explicit: sortedFriends[i].playback!.track.explicit,
      id: sortedFriends[i].playback!.track.id,
      image: sortedFriends[i].playback!.track.image,
      link: sortedFriends[i].playback!.track.link,
      name: sortedFriends[i].playback!.track.name,
      preview_url: sortedFriends[i].playback!.track.preview_url,
      uri: sortedFriends[i].playback!.track.uri,
    };
    friendsTracks.push(track);
  }

  return (
    <Stack pt="50px" pb="100px" spacing={3} w="100%" px={['4px', 'unset']}>
      {favorites.map((user, index) => {
        return (
          <PrismaMiniPlayer
            key={user.userId}
            layoutKey={'MiniPlayerF' + index}
            user={user}
            currentUserId={currentUser?.userId}
            tracks={favsTracks}
            friendsTracks={[]}
            index={index}
          />
        );
      })}
      {sortedFriends.map((user, index) => {
        return (
          <PrismaMiniPlayer
            key={user.userId}
            layoutKey={'MiniPlayerF' + index}
            user={user}
            currentUserId={currentUser?.userId}
            tracks={friendsTracks}
            friendsTracks={[]}
            index={index}
          />
        );
      })}
      {currentUserData && currentUserData.settings?.miniPlayer && (
        <Box position="fixed" bottom="100px" w="100%" pr={['8px', 'unset']}>
          <PrismaMiniPlayer
            key={currentUserData.userId}
            layoutKey="MiniPlayerS"
            user={currentUserData}
            currentUserId={currentUser?.userId}
            index={0}
            friendsTracks={friendsTracks}
            tracks={null}
          />
        </Box>
      )}
    </Stack>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const currentUser = session?.user ?? null;
  const currentUserId = currentUser?.id;

  const [users, friends, favs, pendingRequests] = await Promise.all([
    getAllUsers(!!currentUser),
    prisma.friends
      .findMany({
        include: { user: true },
        where: { friendId: currentUser?.id, status: 'accepted' },
      })
      .then((friends) => getFriends(!!currentUser, friends)),
    prisma.favorite
      .findMany({
        include: { favorite: true },
        where: { favoritedById: currentUser?.id },
      })
      .then((fav) => getFavorites(!!currentUser, fav)),
    prisma.friends
      .findMany({
        include: { user: true },
        where: { friendId: currentUser?.id, status: 'pending' },
      })
      .then((pending) => getFriends(!!currentUser, pending)),
  ]);

  return typedjson({
    currentUserId,
    favs,
    friends,
    pendingRequests,
    users,
  });
};

export const action = async ({ request }: ActionArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const currentUser = session?.user ?? null;
  const id = currentUser?.id;

  const data = await request.formData();
  const friendId = data.get('friendId');
  const clickStatus = data.get('clickStatus');

  //if the user clicks the accept button, update the status of the friend request to accepted
  if (typeof friendId === 'string') {
    if (clickStatus === 'accepted') {
      await prisma.friends.update({
        data: {
          status: 'accepted',
        },
        where: {
          userId_friendId: {
            friendId: id!,
            userId: friendId,
          },
        },
      });

      await prisma.friends.create({
        data: {
          friendId: friendId!,
          status: 'accepted'!,
          userId: id!,
        },
      });
    } else if (clickStatus === 'rejected') {
      await prisma.friends.delete({
        where: {
          userId_friendId: {
            friendId: id!,
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
