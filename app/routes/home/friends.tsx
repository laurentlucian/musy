import { useRevalidator } from '@remix-run/react';
import { useEffect } from 'react';

import { Divider, HStack, Stack, Tab, TabList, TabPanels, Tabs, Text } from '@chakra-ui/react';

import type { Track } from '@prisma/client';
import { Profile2User, ProfileCircle, Star1 } from 'iconsax-react';
import { typedjson } from 'remix-typedjson';

import PrismaMiniPlayer from '~/components/player/home/PrismaMiniPlayer';
import useFavorites from '~/hooks/useFavorites';
import useFriends from '~/hooks/useFriends';
import { useRevalidatorStore } from '~/hooks/useRevalidatorStore';
import useSessionUser from '~/hooks/useSessionUser';
import useUsers from '~/hooks/useUsers';
import useVisibilityChange from '~/hooks/useVisibilityChange';

import { FavoriteTab } from '../../components/friends/tabs/FavoritesTab';
import { FriendsTabs } from '../../components/friends/tabs/FriendsTabs';
import { TempTab } from '../../components/friends/tabs/TempTab';
import { sort } from '../friends';

const Friends = () => {
  const users = useUsers();
  const friends = useFriends();
  const favorites = useFavorites();

  const currentUser = useSessionUser();
  const { revalidate } = useRevalidator();
  const shouldRevalidate = useRevalidatorStore((state) => state.shouldRevalidate);
  const currentUserData = users.filter((user) => user.userId === currentUser?.userId)[0];

  const sortedFriends = sort(friends);

  const sortedFavorites = sort(favorites);

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
    <Tabs colorScheme="green">
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
            <TabList>
              <Tab>
                <HStack>
                  <Profile2User size="18" color="#1DB954" variant="Bold" />
                  <Text fontSize="sm" fontWeight="400">
                    friends
                  </Text>
                  <Text fontSize="xs" fontWeight="300">
                    ~ {friends.length}
                  </Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Star1 size="18" color="yellow" variant="Bold" />
                  <Text fontSize="sm" fontWeight="400">
                    favorites
                  </Text>
                  <Text fontSize="xs" fontWeight="300">
                    ~ {favorites.length}
                  </Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <ProfileCircle size="18" color="#BA68C8" variant="Bold" />
                  <Text fontSize="sm" fontWeight="400">
                    everyone
                  </Text>
                </HStack>
              </Tab>
            </TabList>
            <Divider bgColor="spotify.green" />
          </Stack>
        )}
        <TabPanels>
          <FriendsTabs sortedFriends={sortedFriends} tracks={tracks} />
          <FavoriteTab sortedFavorites={sortedFavorites} />
          <TempTab />
        </TabPanels>
      </Stack>
    </Tabs>
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
