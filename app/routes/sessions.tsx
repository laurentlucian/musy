import { Stack, useColorModeValue } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import SessionModal from '~/components/sessions/SessionModal';
import SessionT from '~/components/sessions/SessionTile';

import { getSessions } from './home/sessions';

const Sessions = () => {
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
        const tracks = session.songs.map(({ track }) => track);
        return (
          <Stack spacing={3} key={session.id}>
            <SessionModal session={session}>
              {session.songs.map(({ id, track, userId }, index) => {
                return (
                  <SessionT
                    key={id}
                    layoutKey="Session"
                    track={track}
                    userId={userId}
                    tracks={tracks}
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

export const loader = async () => {
  const sessions = await getSessions();

  return typedjson({ sessions });
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export { CatchBoundary } from '~/components/error/CatchBoundary';
export default Sessions;
