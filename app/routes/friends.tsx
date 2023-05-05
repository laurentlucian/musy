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
import { authenticator, getFavorites, getFriends, getPending } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

const Friends = () => {
  const { favs, friends } = useTypedLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  const currentUser = useSessionUser();
  const shouldRevalidate = useRevalidatorStore((state) => state.shouldRevalidate);

  const friendsList = friends?.filter(({ friend }) => {
    return !favs?.some(({ favorite }) => favorite.userId === friend.userId);
  });

  useVisibilityChange((isVisible) => isVisible === true && !shouldRevalidate && revalidate());

  useEffect(() => {
    if (shouldRevalidate) {
      console.log('shouldRevalidate', shouldRevalidate);
      // revalidate();
    }
  }, [shouldRevalidate, revalidate]);

  if (!friendsList) return null;

  const friendsTracks: Track[] = [];
  for (let i = 0; i < friendsList.length; i++) {
    if (
      friendsList[i].friend.playback === null ||
      friendsList[i].friend.playback?.track === undefined
    ) {
      continue;
    }
    const track = {
      albumName: friendsList[i].friend.playback!.track.albumName,
      albumUri: friendsList[i].friend.playback!.track.albumUri,
      artist: friendsList[i].friend.playback!.track.artist,
      artistUri: friendsList[i].friend.playback!.track.artistUri,
      duration: friendsList[i].friend.playback!.track.duration,
      explicit: friendsList[i].friend.playback!.track.explicit,
      id: friendsList[i].friend.playback!.track.id,
      image: friendsList[i].friend.playback!.track.image,
      link: friendsList[i].friend.playback!.track.link,
      name: friendsList[i].friend.playback!.track.name,
      preview_url: friendsList[i].friend.playback!.track.preview_url,
      uri: friendsList[i].friend.playback!.track.uri,
    };
    friendsTracks.push(track);
  }
  const favsTracks: Track[] = [];
  for (let i = 0; i < friendsList.length; i++) {
    if (
      friendsList[i].friend.playback === null ||
      friendsList[i].friend.playback?.track === undefined
    ) {
      continue;
    }
    const track = {
      albumName: friendsList[i].friend.playback!.track.albumName,
      albumUri: friendsList[i].friend.playback!.track.albumUri,
      artist: friendsList[i].friend.playback!.track.artist,
      artistUri: friendsList[i].friend.playback!.track.artistUri,
      duration: friendsList[i].friend.playback!.track.duration,
      explicit: friendsList[i].friend.playback!.track.explicit,
      id: friendsList[i].friend.playback!.track.id,
      image: friendsList[i].friend.playback!.track.image,
      link: friendsList[i].friend.playback!.track.link,
      name: friendsList[i].friend.playback!.track.name,
      preview_url: friendsList[i].friend.playback!.track.preview_url,
      uri: friendsList[i].friend.playback!.track.uri,
    };
    friendsTracks.push(track);
  }

  return (
    <Stack pt="50px" pb="100px" spacing={3} w="100%" px={['4px', 'unset']}>
      {favs &&
        favs.map(({ favorite }, index) => {
          return (
            <PrismaMiniPlayer
              key={favorite.userId}
              layoutKey={'MiniPlayerF' + index}
              user={favorite}
              currentUserId={currentUser?.userId}
              tracks={favsTracks}
              friendsTracks={[]}
              index={index}
            />
          );
        })}
      {friendsList.map(({ friend }, index) => {
        return (
          <PrismaMiniPlayer
            key={friend.userId}
            layoutKey={'MiniPlayerF' + index}
            user={friend}
            currentUserId={currentUser?.userId}
            tracks={friendsTracks}
            friendsTracks={[]}
            index={index}
          />
        );
      })}
      {currentUser?.settings?.miniPlayer && (
        <Box position="fixed" bottom="100px" w="100%" pr={['8px', 'unset']}>
          <PrismaMiniPlayer
            key={currentUser.userId}
            layoutKey="MiniPlayerS"
            user={currentUser}
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
  const currentUser = session?.user ?? null;
  const id = currentUser?.id;

  const data = await request.formData();
  const friendId = data.get('friendId');
  const clickStatus = data.get('clickStatus');

  //if the user clicks the accept button, update the status of the friend request to accepted
  if (typeof friendId === 'string') {
    if (clickStatus === 'accepted') {
      await prisma.friend.create({
        data: {
          friendId: id!,
          userId: friendId,
        },
      });

      await prisma.friend.create({
        data: {
          friendId: friendId!,
          userId: id!,
        },
      });
    } else if (clickStatus === 'rejected') {
      await prisma.friend.delete({
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
