import type { LoaderArgs } from '@remix-run/node';

import { Stack, useColorModeValue } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import SessionModal from '~/components/sessions/SessionModal';
import SessionT from '~/components/sessions/SessionTile';
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

const Friends = () => {
  const { sessions } = useTypedLoaderData<typeof loader>();
  const bg = useColorModeValue('#EEE6E2', '#050404');

  return (
    <Stack
      pb="50px"
      pt={{ base: '60px', xl: 0 }}
      spacing={3}
      w="100%"
      h="100%"
      px={['4px', 0]}
      mb={['100px', 0]}
      bg={bg}
    >
      {sessions.map((session) => {
        return (
          <Stack spacing={3} key={session.id}>
            <SessionModal session={session}>
              {session.songs.map(({ id, track, userId }) => {
                return <SessionT key={id} layoutKey="Session" track={track} userId={userId} />;
              })}
            </SessionModal>
          </Stack>
        );
      })}
    </Stack>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const currentUser = session?.user ?? null;

  const currentUserId = currentUser?.id;

  const sessions = await prisma.sessions.findMany({
    include: {
      songs: {
        include: {
          track: true,
        },
        orderBy: {
          playedAt: 'desc',
        },
      },
      user: {
        include: {
          playback: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    where: {
      updatedAt: {
        // Last week
        gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      },
    },
  });

  return typedjson(
    { currentUserId, now: Date.now(), sessions },
    {
      headers: { 'Cache-Control': 'private, maxage=10, stale-while-revalidate=0' },
    },
  );
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export { CatchBoundary } from '~/components/error/CatchBoundary';
export default Friends;
