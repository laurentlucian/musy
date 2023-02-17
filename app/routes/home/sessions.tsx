import type { LoaderArgs } from '@remix-run/node';

import { Stack, useColorModeValue } from '@chakra-ui/react';

import type { Prisma } from '@prisma/client';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import SessionModal from '~/components/sessions/SessionModal';
import SessionT from '~/components/sessions/SessionTile';
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

const Friends = () => {
  const { sessions } = useTypedLoaderData<typeof loader>();
  const bg = useColorModeValue('#EEE6E2', '#050404');

  return (
    <Stack pb="50px" pt={{ base: 4, md: 0 }} spacing={3} w="100%" px={['4px', 0]} bg={bg}>
      {sessions.map((session) => {
        return (
          <Stack spacing={3} key={session.id}>
            <SessionModal session={session} user={session.user}>
              {session.songs.map(({ id, playedAt, track, userId }) => {
                return <SessionT key={id} track={track} playedAt={playedAt} userId={userId} />;
              })}
            </SessionModal>
          </Stack>
        );
      })}
    </Stack>
  );
};

function getSessions() {
  return prisma.sessions.findMany({
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
      startTime: 'desc',
    },
    take: 30,
  });
}

export type SessionsWithData = Prisma.PromiseReturnType<typeof getSessions>;

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const currentUser = session?.user ?? null;

  const currentUserId = currentUser?.id;

  const sessions = await getSessions();

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
