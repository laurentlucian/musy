import type { LoaderArgs } from '@remix-run/node';

import { Divider, Stack, Text } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import SessionModal from '~/components/sessions/SessionModal';
import SessionTiles from '~/components/tiles/SessionTiles';
import { timeSince } from '~/lib/utils';
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

const Friends = () => {
  const { sessions } = useTypedLoaderData<typeof loader>();

  return (
    <Stack pb="50px" pt={{ base: 4, md: 0 }} spacing={3} w="100%" px={['4px', 0]}>
      {sessions.map((session) => {
        return (
          <Stack spacing={3} key={session.id}>
            <SessionModal title={timeSince(session.startTime)} user={session.user}>
              {/* <Tiles
              title={`${new Date(session.startTime).toLocaleString()} ${
                session.user.name
              } listened to ${session.songs.length} songs `}
            > */}

              {session.songs.map(({ id, track }) => {
                return (
                  <SessionTiles
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
                    trackDuration={track.duration}
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
