import type { LoaderArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { useMemo } from 'react';

import { Stack, useColorModeValue } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import ActivityTile from '~/components/activity/ActivityTile';
import MobileActivityTile from '~/components/activity/MobileActivityTile';
import Tiles from '~/components/tiles/Tiles';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';
import type { Activity, Track } from '~/lib/types/types';
import { authenticator, getAllUsers } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

import { getFriends } from './friends';

const Index = () => {
  const currentUser = useSessionUser();
  const isSmallScreen = useIsMobile();
  const { activity } = useTypedLoaderData<typeof loader>();
  const bg = useColorModeValue('#EEE6E2', '#050404');

  const tracks: Track[] = useMemo(() => {
    return activity.map((item) => {
      return {
        albumName: item.track.albumName,
        albumUri: item.track.albumUri,
        artist: item.track.artist,
        artistUri: item.track.artistUri,
        duration: 0,
        explicit: item.track.explicit,
        id: item.trackId,
        image: item.track.image,
        link: item.track.link,
        name: item.track.name,
        preview_url: item.track.preview_url ?? '',
        uri: item.track.uri,
      };
    });
  }, [activity]);

  return (
    <Stack pb="50px" pt={{ base: '60px', xl: 0 }} bg={bg} h="100%">
      <Stack px={['5px', 0]}>
        {isSmallScreen ? (
          <Stack bg={bg} mb="100px">
            {activity.map((item, index) => {
              return (
                <MobileActivityTile
                  key={item.id}
                  layoutKey={'mActivity' + index}
                  activity={item}
                  tracks={tracks}
                  index={index}
                />
              );
            })}
          </Stack>
        ) : (
          <Tiles spacing="15px" autoScroll={currentUser?.settings?.autoscroll ?? false}>
            {activity.map((item, index) => {
              return (
                <ActivityTile
                  key={item.id}
                  layoutKey={'mActivity' + index}
                  activity={item}
                  tracks={tracks}
                  index={index}
                />
              );
            })}
          </Tiles>
        )}
      </Stack>
      <Outlet />
    </Stack>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const currentUser = session?.user ?? null;
  const users = await getAllUsers(!!currentUser);

  const currentUserId = currentUser?.id;

  const currentFriends = await prisma.friends.findMany({
    include: { user: true },
    where: { friendId: currentUser?.id, status: 'accepted' },
  });

  const friends = await getFriends(!!currentUser, currentFriends);

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

  const liked = prisma.likedSongs
    .findMany({
      include: {
        track: {
          include: {
            liked: { orderBy: { likedAt: 'asc' }, select: { user: true } },
            recent: { select: { user: true } },
          },
        },
        user: true,
      },
      orderBy: { likedAt: 'desc' },
      take: 20,
    })
    .then((data) => data.map((data) => ({ ...data, createdAt: data.likedAt })));

  const queued = prisma.queue.findMany({
    include: {
      owner: { select: { accessToken: false, user: true } },
      track: {
        include: { liked: { select: { user: true } }, recent: { select: { user: true } } },
      },
      user: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const songs = await Promise.all([liked, queued]);

  const activity = songs
    .flat()
    .sort((a, b) => {
      if (a.createdAt && b.createdAt) return b.createdAt.getTime() - a.createdAt.getTime();
      return 0;
    })
    .slice(0, 20) as Activity[];

  return typedjson({
    activity,
    currentFriends,
    currentUserId,
    friends,
    now: Date.now(),
    pendingFriendProfiles,
    pendingFriends,
    users,
  });
};

export default Index;

export { CatchBoundary } from '~/components/error/CatchBoundary';
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
