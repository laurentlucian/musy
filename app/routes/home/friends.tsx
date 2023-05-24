import type { LoaderArgs } from '@remix-run/server-runtime';

import { HStack, Stack, Tab, TabList, TabPanels, Tabs, Text } from '@chakra-ui/react';

import { Profile2User, ProfileCircle, Star1 } from 'iconsax-react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import { FavoriteTab } from '~/components/home/friends/tabs/FavoritesTab';
import { FriendsTabs } from '~/components/home/friends/tabs/FriendsTabs';
import MiniPlayer from '~/components/profile/player/MiniPlayer';
import useFavorites from '~/hooks/useFavorites';
import useSessionUser from '~/hooks/useSessionUser';
import type { TrackWithInfo } from '~/lib/types/types';
import { authenticator } from '~/services/auth.server';
import { getFriends } from '~/services/prisma/users.server';

const Friends = () => {
  const favorites = useFavorites();
  const { friends } = useTypedLoaderData<typeof loader>();
  const currentUser = useSessionUser();

  const tracks = [] as TrackWithInfo[];
  for (const { friend } of friends) {
    if (!friend.playback || !friend.playback) continue;
    tracks.push(friend.playback.track);
  }

  return (
    <Tabs colorScheme="green">
      <Stack pb="50px" pt={{ base: 4, md: 0 }} spacing={3} w="100%" h="100%" px={['4px', 0]}>
        {currentUser && (
          <Stack mt={7}>
            {currentUser.settings?.miniPlayer && (
              <MiniPlayer
                key={currentUser.userId}
                layoutKey="MiniPlayerS"
                user={currentUser}
                currentUserId={currentUser.userId}
                index={0}
                tracks={tracks}
              />
            )}
            <TabList>
              {friends && friends.length > 0 && (
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
              )}
              {favorites.length > 0 && (
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
              )}
              <Tab>
                <HStack>
                  <ProfileCircle size="18" color="#BA68C8" variant="Bold" />
                  <Text fontSize="sm" fontWeight="400">
                    everyone
                  </Text>
                </HStack>
              </Tab>
            </TabList>
          </Stack>
        )}
        <TabPanels>
          {friends && friends.length > 0 && <FriendsTabs friends={friends} tracks={tracks} />}
          {favorites.length > 0 && <FavoriteTab favorites={favorites} />}
        </TabPanels>
      </Stack>
    </Tabs>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const currentUser = session?.user ?? null;
  const friends = (await getFriends(currentUser?.id)) ?? [];
  return typedjson({
    friends,
  });
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export { CatchBoundary } from '~/components/error/CatchBoundary';
export default Friends;
