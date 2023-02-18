import { Outlet } from '@remix-run/react';

import { Stack, useColorModeValue } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import ActivityTile from '~/components/activity/ActivityTile';
import MobileActivityTile from '~/components/activity/MobileActivityTile';
import Tiles from '~/components/tiles/Tiles';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';
import type { Activity } from '~/lib/types/types';
import { prisma } from '~/services/db.server';

const Index = () => {
  const currentUser = useSessionUser();
  const isSmallScreen = useIsMobile();
  const { activity } = useTypedLoaderData<typeof loader>();
  const bg = useColorModeValue('#EEE6E2', '#050404');

  return (
    <Stack pb="50px" pt={{ base: '60px', xl: 0 }} bg={bg} h="100vh">
      <Stack px={['5px', 0]}>
        {isSmallScreen ? (
          <Stack bg={bg} mb="100px">
            {activity.map((item) => {
              return <MobileActivityTile key={item.id} activity={item} />;
            })}
          </Stack>
        ) : (
          <Tiles spacing="15px" autoScroll={currentUser?.settings?.autoscroll ?? true}>
            {activity.map((item) => {
              return <ActivityTile key={item.id} activity={item} />;
            })}
          </Tiles>
        )}
      </Stack>
      <Outlet />
    </Stack>
  );
};

export const loader = async () => {
  // const session = await authenticator.isAuthenticated(request);
  // const currentUser = session?.user ?? null;
  // const users = await getAllUsers(!!currentUser);

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

  return typedjson({ activity });
};

export default Index;

export { CatchBoundary } from '~/components/error/CatchBoundary';
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
