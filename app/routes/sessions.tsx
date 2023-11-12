import { Stack, useColorModeValue } from '@chakra-ui/react';

import type { Prisma } from '@prisma/client';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import SessionModal from '~/components/sessions/SessionModal';
import SessionT from '~/components/sessions/SessionTile';
import { getSessions } from '~/services/prisma/tracks.server';

const Sessions = () => {
  const { sessions } = useTypedLoaderData<typeof loader>();
  const bg = useColorModeValue('#EEE6E2', '#050404');

  return (
    <Stack pb="50px" pt={{ base: 4, md: 0 }} spacing={3} w="100%" h="100%" px={['4px', 0]} bg={bg}>
      {sessions.map((session) => {
        const tracks = session.songs.map(({ track }) => track);
        return (
          <Stack spacing={3} key={session.id}>
            <SessionModal session={session}>
              {session.songs.map(({ id, playedAt, track, userId }, index) => {
                return (
                  <SessionT
                    key={id}
                    layoutKey="HomeSession"
                    track={track}
                    tracks={tracks}
                    playedAt={playedAt}
                    userId={userId}
                    index={index}
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

export type SessionsWithData = Prisma.PromiseReturnType<typeof getSessions>;

export const loader = async () => {
  const sessions = await getSessions();

  return typedjson({ sessions });
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default Sessions;
