import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { useRevalidator } from '@remix-run/react';
import { useEffect } from 'react';

import { Divider, HStack, Stack, Tab, TabList, TabPanels, Tabs, Text } from '@chakra-ui/react';

import type { Playback, Profile, Settings, Track } from '@prisma/client';
import type { Friends as PrismaFriends, Favorite as PrismaFavorite } from '@prisma/client';
import { Profile2User, ProfileCircle, Star1 } from 'iconsax-react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import { FavoriteTab } from '~/components/friends/tabs/FavoritesTab';
import { FriendsTabs } from '~/components/friends/tabs/FriendsTabs';
import { TempTab } from '~/components/friends/tabs/TempTab';
import PrismaMiniPlayer from '~/components/player/home/PrismaMiniPlayer';
import { useRevalidatorStore } from '~/hooks/useRevalidatorStore';
import useSessionUser from '~/hooks/useSessionUser';
import useVisibilityChange from '~/hooks/useVisibilityChange';
import { notNull } from '~/lib/utils';
import { authenticator, getAllUsers } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

const Friends = () => {
  const { currentUserId, favs, friends, pendingFriends, users } =
    useTypedLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  const currentUser = useSessionUser();
  const shouldRevalidate = useRevalidatorStore((state) => state.shouldRevalidate);

  const sort = (
    array: (Profile & {
      playback:
        | (Playback & {
            track: Track & {
              liked: {
                user: Profile;
              }[];
              recent: {
                user: Profile;
              }[];
            };
          })
        | null;
      settings: Settings | null;
    })[],
  ) => {
    return array.sort((a, b) => {
      // sort by playback status first
      if (!!b.playback?.updatedAt && !a.playback?.updatedAt) {
        return 1;
      } else if (!!a.playback?.updatedAt && !b.playback?.updatedAt) {
        return -1;
      }
      // then sort by name in alphabetical order
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
  };

  const sortedFriends = sort(friends);

  const sortedFavorites = sort(favs);

  const sortedPendingFriends = sort(pendingFriends);

  const everyone = sort(users);

  const currentUserData = users.filter((user) => user.userId === currentUserId)[0];

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
    <Stack>
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
                      ~ {favs.length}
                    </Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <ProfileCircle size="18" color="#BA68C8" variant="Bold" />
                    <Text fontSize="sm" fontWeight="400">
                      everyone
                    </Text>
                    <Text fontSize="xs" fontWeight="300">
                      ~ {everyone.length}
                    </Text>
                  </HStack>
                </Tab>
              </TabList>
              <Divider bgColor="spotify.green" />
            </Stack>
          )}
          <TabPanels>
            <FriendsTabs
              currentUser={currentUser}
              sortedFriends={sortedFriends}
              tracks={tracks}
              sortedPendingFriends={sortedPendingFriends}
            />
            <FavoriteTab currentUser={currentUser} sortedFavorites={sortedFavorites} />
            <TempTab currentUser={currentUser} everyone={everyone} />
          </TabPanels>
        </Stack>
      </Tabs>
    </Stack>
  );
};

export const getFriends = async (isAuthenticated = false, currentFriends: PrismaFriends[]) => {
  const restrict = !isAuthenticated
    ? { user: { settings: { isNot: { isPrivate: true } } } }
    : undefined;

  const data = await prisma.user.findMany({
    orderBy: { user: { playback: { updatedAt: 'desc' } } },
    select: {
      user: {
        include: {
          playback: {
            include: {
              track: {
                include: {
                  liked: { select: { user: true } },
                  recent: { select: { user: true } },
                },
              },
            },
          },
          settings: true,
        },
      },
    },
    where: {
      id: {
        in: currentFriends.map((currentFriend) => {
          return currentFriend.userId;
        }),
      },
      revoked: false,
      ...restrict,
    },
  });
  const users = data.map((user) => user.user).filter(notNull);
  return users;
};

export const getFavorites = async (isAuthenticated = false, currentFavorites: PrismaFavorite[]) => {
  const restrict = !isAuthenticated
    ? { user: { settings: { isNot: { isPrivate: true } } } }
    : undefined;

  const data = await prisma.user.findMany({
    orderBy: { user: { playback: { updatedAt: 'desc' } } },
    select: {
      user: {
        include: {
          playback: {
            include: {
              track: {
                include: {
                  liked: { select: { user: true } },
                  recent: { select: { user: true } },
                },
              },
            },
          },
          settings: true,
        },
      },
    },
    where: {
      id: {
        in: currentFavorites.map((currentFavorites) => {
          return currentFavorites.favoriteId;
        }),
      },
      revoked: false,
      ...restrict,
    },
  });
  const users = data.map((user) => user.user).filter(notNull);
  return users;
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const currentUser = session?.user ?? null;
  const currentUserId = currentUser?.id;
  const users = await getAllUsers(!!currentUser);

  const currentFriends = await prisma.friends.findMany({
    include: { user: true },
    where: { friendId: currentUser?.id, status: 'accepted' },
  });

  const currentFavorites = await prisma.favorite.findMany({
    include: { favorite: true },
    where: { favoritedById: currentUser?.id },
  });

  const friends = await getFriends(!!currentUser, currentFriends);

  const favs = await getFavorites(!!currentUser, currentFavorites);

  const pendingFriends = await prisma.friends.findMany({
    where: { friendId: currentUser?.id, status: 'pending' },
  });

  const pendingFriendProfiles = await prisma.profile.findMany({
    where: {
      userId: {
        in: pendingFriends.map((pendingFriend) => {
          return pendingFriend.userId;
        }),
      },
    },
  });

  return typedjson({
    currentFriends,
    currentUserId,
    favs,
    friends,
    now: Date.now(),
    pendingFriendProfiles,
    pendingFriends,
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

  console.log('in action pending friends: ' + typeof friendId + ' ' + clickStatus);
  const test = clickStatus === 'rejected';
  console.log(test);
  //if the user clicks the accept button, update the status of the friend request to accepted
  if (typeof friendId === 'string') {
    if (clickStatus === 'accepted') {
      console.log('in accept');
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
      console.log('in reject');
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
