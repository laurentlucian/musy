import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { useRevalidator } from '@remix-run/react';
import { useEffect } from 'react';

import {
  Stack,
  Tab,
  Divider,
  HStack,
  Image,
  Text,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
} from '@chakra-ui/react';

import type { Friends as PrismaFriends } from '@prisma/client';
import type { User } from '@prisma/client';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import PendingFriendsContainer from '~/components/friends/PendingFriendsContainer';
import PrismaMiniPlayer from '~/components/player/home/PrismaMiniPlayer';
import { useRevalidatorStore } from '~/hooks/useRevalidatorStore';
import useVisibilityChange from '~/hooks/useVisibilityChange';
import type { Track } from '~/lib/types/types';
import { notNull } from '~/lib/utils';
import { authenticator, getAllUsers } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

const Friends = () => {
  const { currentFriends, currentUserId, pendingFriendProfiles, pendingFriends, users } =
    useTypedLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  const shouldRevalidate = useRevalidatorStore((state) => state.shouldRevalidate);
  const friends = users.filter((user) => user.userId !== currentUserId);

  const sortedFriends = friends.sort((a, b) => {
    // sort by playback status first
    if (!!b.playback?.updatedAt && !a.playback?.updatedAt) {
      return 1;
    } else if (!!a.playback?.updatedAt && !b.playback?.updatedAt) {
      return -1;
    }
    // then sort by name in alphabetical order
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

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

  const friendsTabImg = currentFriends ? <Image boxSize="15px" src="/users.svg" /> : null;

  const friendsTabText = currentFriends ? (
    <Text fontSize="sm" fontWeight="400" color="white">
      friends
    </Text>
  ) : null;

  const friendsTabLength = currentFriends ? (
    <Text fontSize="xs" fontWeight="300" color="white">
      ~{currentFriends.length}
    </Text>
  ) : null;

  const friendRequestsTabImg = pendingFriends ? <Image boxSize="15px" src="/users.svg" /> : null;

  const friendRequestsTabText = pendingFriends ? (
    <Text fontSize="sm" fontWeight="400" color="white">
      requests
    </Text>
  ) : null;

  const friendRequestsTabLength = pendingFriends ? (
    <Text fontSize="xs" fontWeight="300" color="white">
      ~{pendingFriends.length}
    </Text>
  ) : null;

  return (
    <Stack pt={{ base: '60px', xl: 0 }} pb="100px" spacing={3} w="100%" h="100%" px={['4px', 0]}>
      <HStack>
        <Tabs colorScheme="white" variant="soft-rounded">
          <TabList>
            <Tab>
              {friendsTabImg}
              {friendsTabText}
              {friendsTabLength}
            </Tab>
            <Tab>
              {friendRequestsTabImg}
              {friendRequestsTabText}
              {friendRequestsTabLength}
            </Tab>
          </TabList>
          <Divider bgColor="spotify.green" />
          <TabPanels>
            <TabPanel>
              {' '}
              {currentUserData && currentUserData.settings?.miniPlayer && (
                <Stack w="100%" h="100%">
                  {currentUserData.settings?.miniPlayer && (
                    <PrismaMiniPlayer
                      key={currentUserData.userId}
                      layoutKey="MiniPlayer"
                      user={currentUserData}
                      currentUserId={currentUserId}
                      tracks={null}
                      friendsTracks={tracks}
                      index={0}
                    />
                  )}
                </Stack>
              )}
              {sortedFriends.map((user, index) => {
                return (
                  <PrismaMiniPlayer
                    key={user.userId}
                    layoutKey={'MiniPlayer' + index}
                    user={user}
                    currentUserId={currentUserId}
                    tracks={tracks}
                    friendsTracks={[]}
                    index={index}
                  />
                );
              })}
            </TabPanel>
            <TabPanel>
              <Stack>
                {pendingFriendProfiles.map((pendingFriend) => {
                  return (
                    <PendingFriendsContainer
                      key={pendingFriend.userId}
                      image={pendingFriend.image}
                      name={pendingFriend.name}
                      userId={pendingFriend.userId}
                    />
                  );
                })}
              </Stack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </HStack>
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

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const currentUser = session?.user ?? null;
  const currentUserId = currentUser?.id;

  const currentFriends = await prisma.friends.findMany({
    include: { user: true },
    where: { friendId: currentUser?.id, status: 'accepted' },
  });

  const users = await getFriends(!!currentUser, currentFriends);

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
