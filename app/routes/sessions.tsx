import type { LoaderArgs } from '@remix-run/node';

import { Stack, useColorModeValue } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import SessionT from '~/components/sessions/SassionT';
import SessionModal from '~/components/sessions/SessionModal';
import { timeSince } from '~/lib/utils';
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

const Friends = () => {
  const { sessions } = useTypedLoaderData<typeof loader>();
  const bg = useColorModeValue('#EEE6E2', '#050404');

  return (
    <Stack
      pb="50px"
      pt={{ base: 4, md: 0 }}
      spacing={3}
      w="100%"
      px={['4px', 0]}
      mb={['100px', 0]}
      bg={bg}
    >
      {sessions.map((session) => {
        return (
          <Stack spacing={3} key={session.id}>
            <SessionModal title={timeSince(session.startTime)} user={session.user}>
              {session.songs.map(({ id, track }) => {
                return (
                  <SessionT
                    key={id}
                    uri={track.uri}
                    trackId={track.id}
                    image={track.image}
                    albumUri={track.albumUri}
                    albumName={track.albumName}
                    name={track.name}
                    artist={track.artist}
                    artistUri={track.artistUri}
                    explicit={track.explicit}
                    preview_url={track.preview_url}
                    link={track.preview_url!}
                  />
                );
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
      user: true,
    },
    orderBy: {
      startTime: 'desc',
    },
    take: 30,
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
