import { useRevalidator } from '@remix-run/react';
import { useEffect } from 'react';

import { Divider, HStack, Image, Stack, Text } from '@chakra-ui/react';

import { typedjson } from 'remix-typedjson';

import PrismaMiniPlayer from '~/components/player/home/PrismaMiniPlayer';
import { useRevalidatorStore } from '~/hooks/useRevalidatorStore';
import useSessionUser from '~/hooks/useSessionUser';
import useUsers from '~/hooks/useUsers';
import useVisibilityChange from '~/hooks/useVisibilityChange';
import type { Track } from '~/lib/types/types';

const Friends = () => {
  const users = useUsers();
  const currentUser = useSessionUser();
  const { revalidate } = useRevalidator();
  const shouldRevalidate = useRevalidatorStore((state) => state.shouldRevalidate);
  const currentUserData = users.filter((user) => user.userId === currentUser?.userId)[0];
  const otherUsers = users.filter((user) => user.userId !== currentUser?.userId);
  const sortedFriends = otherUsers.sort((a, b) => {
    // sort by playback status first
    if (!!b.playback?.updatedAt && !a.playback?.updatedAt) {
      return 1;
    } else if (!!a.playback?.updatedAt && !b.playback?.updatedAt) {
      return -1;
    }
    // then sort by name in alphabetical order
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  useVisibilityChange((isVisible) => isVisible === true && !shouldRevalidate && revalidate());

  useEffect(() => {
    if (shouldRevalidate) {
      console.log('shouldRevalidate', shouldRevalidate);
      // revalidate();
    }
  }, [shouldRevalidate, revalidate]);

  const tracks: Track[] = [];
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
    tracks.push(track);
  }

  return (
    <Stack pb="50px" pt={{ base: 4, md: 0 }} spacing={3} w="100%" h="100%" px={['4px', 0]}>
      {currentUserData && (
        <Stack mt={7}>
          {currentUserData.settings?.miniPlayer && (
            <PrismaMiniPlayer
              key={currentUserData.userId}
              layoutKey="MiniPlayerS"
              user={currentUserData}
              currentUserId={currentUser?.userId}
              index={0}
              friendsTracks={tracks}
              tracks={null}
            />
          )}
          <HStack>
            <Image boxSize="15px" src="/users.svg" />
            <Text fontSize="sm" fontWeight="400">
              friends
            </Text>
            <Text fontSize="xs" fontWeight="300">
              ~ {otherUsers.length}
            </Text>
          </HStack>
          <Divider bgColor="spotify.green" />
        </Stack>
      )}
      {sortedFriends.map((user, index) => {
        return (
          <PrismaMiniPlayer
            key={user.userId}
            layoutKey={'MiniPlayerF' + index}
            user={user}
            currentUserId={currentUser?.userId}
            tracks={tracks}
            friendsTracks={[]}
            index={index}
          />
        );
      })}
    </Stack>
  );
};

export const loader = async () => {
  return typedjson({
    headers: { 'Cache-Control': 'private, maxage=10, stale-while-revalidate=0' },
  });
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export { CatchBoundary } from '~/components/error/CatchBoundary';
export default Friends;
