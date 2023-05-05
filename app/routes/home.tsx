import type { LoaderArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';

import { Stack, useColorModeValue } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import ActivityTile from '~/components/activity/ActivityTile';
import MobileActivityTile from '~/components/activity/MobileActivityTile';
import Tiles from '~/components/tiles/Tiles';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';
import type { Activity, Track } from '~/lib/types/types';
import { authenticator, getFavorites, getFriends, getPending } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

const Index = () => {
  const currentUser = useSessionUser();
  const isSmallScreen = useIsMobile();
  const { activity } = useTypedLoaderData<typeof loader>();
  const bg = useColorModeValue('#EEE6E2', '#050404');

  if (!activity) return null;
  let tracks: Track[] = [];

  for (let i = 0; i < activity.length; i++) {
    tracks.push({
      albumName: activity[i].track.albumName,
      albumUri: activity[i].track.albumUri,
      artist: activity[i].track.artist,
      artistUri: activity[i].track.artistUri,
      duration: 0,
      explicit: activity[i].track.explicit,
      id: activity[i].trackId,
      image: activity[i].track.image,
      link: activity[i].track.link,
      name: activity[i].track.name,
      preview_url: activity[i].track.preview_url ?? '',
      uri: activity[i].track.uri,
    });
  }

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

const getActivity = async (): Promise<Activity[] | null> => {
  const [like, queue] = await Promise.all([
    prisma.likedSongs.findMany({
      include: {
        track: {
          include: {
            liked: { orderBy: { createdAt: 'asc' }, select: { user: true } },
            recent: { select: { user: true } },
          },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.queue.findMany({
      include: {
        owner: { select: { accessToken: false, user: true } },
        track: {
          include: { liked: { select: { user: true } }, recent: { select: { user: true } } },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);
  if (like || queue) {
    return [...like, ...queue]
      .sort((a, b) => {
        if (a.createdAt && b.createdAt) return b.createdAt.getTime() - a.createdAt.getTime();
        return 0;
      })
      .slice(0, 20) as Activity[];
  }
  return null;
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const currentUserId = session?.user?.id;

  const [friends, favs, pendingFriends, activity] = await Promise.all([
    getFriends(currentUserId),
    getFavorites(currentUserId),
    getPending(currentUserId),
    getActivity(),
  ]);

  return typedjson({
    activity,
    currentUserId,
    favs,
    friends,
    pendingFriends,
  });
};

export default Index;

export { CatchBoundary } from '~/components/error/CatchBoundary';
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
