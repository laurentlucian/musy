import type { ActionArgs, LoaderArgs } from '@remix-run/node';

import { Box, Stack } from '@chakra-ui/react';

import type { Track } from '@prisma/client';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import PrismaMiniPlayer from '~/components/player/home/PrismaMiniPlayer';
import useSessionUser from '~/hooks/useSessionUser';
import { authenticator, getFavorites, getFriends, getPending } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

const Friends = () => {
  const { favs, friends } = useTypedLoaderData<typeof loader>();
  const currentUser = useSessionUser();

  const friendsList = friends?.filter(({ friend }) => {
    return !favs?.some(({ favorite }) => favorite.userId === friend.userId);
  });

  const friendsTracks: Track[] = [];
  if (friendsList) {
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
  }

  const favsTracks: Track[] = [];

  if (favs) {
    for (let i = 0; i < favs.length; i++) {
      if (favs[i].favorite.playback === null || favs[i].favorite.playback?.track === undefined) {
        continue;
      }
      const track = {
        albumName: favs[i].favorite.playback!.track.albumName,
        albumUri: favs[i].favorite.playback!.track.albumUri,
        artist: favs[i].favorite.playback!.track.artist,
        artistUri: favs[i].favorite.playback!.track.artistUri,
        duration: favs[i].favorite.playback!.track.duration,
        explicit: favs[i].favorite.playback!.track.explicit,
        id: favs[i].favorite.playback!.track.id,
        image: favs[i].favorite.playback!.track.image,
        link: favs[i].favorite.playback!.track.link,
        name: favs[i].favorite.playback!.track.name,
        preview_url: favs[i].favorite.playback!.track.preview_url,
        uri: favs[i].favorite.playback!.track.uri,
      };
      favsTracks.push(track);
    }
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
              index={index}
            />
          );
        })}
      {friendsList?.map(({ friend }, index) => {
        return (
          <PrismaMiniPlayer
            key={friend.userId}
            layoutKey={'MiniPlayerF' + index}
            user={friend}
            currentUserId={currentUser?.userId}
            tracks={friendsTracks}
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
            tracks={friendsTracks}
          />
        </Box>
      )}
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
