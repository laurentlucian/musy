import { Heading, Stack, Text } from '@chakra-ui/react';

import { useCatch } from '@remix-run/react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import type { LoaderArgs } from '@remix-run/node';
import MiniPlayer from '~/components/MiniPlayer';
import { authenticator, getAllUsers } from '~/services/auth.server';
import { getUserQueue } from '~/services/spotify.server';
import loading from '~/lib/styles/loading.css';
import { notNull } from '~/lib/utils';

export const links = () => {
  return [{ rel: 'stylesheet', href: loading }];
};

const Index = () => {
  const { users, playbacks } = useTypedLoaderData<typeof loader>();

  return (
    <Stack>
      {users.map((user) => {
        const playback = playbacks.find((data) => data.userId === user.userId);
        return <MiniPlayer key={user.userId} user={user} playback={playback} />;
      })}
    </Stack>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const users = await getAllUsers();
  const session = await authenticator.isAuthenticated(request);
  const user = session?.user ?? null;

  if (!users.length) return typedjson({ users, user, playbacks: [] });

  const getPlaybackState = async (id: string) => {
    try {
      const data = await getUserQueue(id);
      if (!data.currently_playing) return null;
      return data;
    } catch {
      return null;
    }
  };

  const playbacks = (await Promise.all(users.map((user) => getPlaybackState(user.userId)))).filter(
    notNull,
  );

  const isPlayingIds = playbacks.map((data) => data.userId);
  // place playingNow users at top; o(n) but n is small
  users.sort((a, b) => isPlayingIds.indexOf(b.userId) - isPlayingIds.indexOf(a.userId));

  return typedjson(
    { users, user, playbacks },
    {
      headers: { 'Cache-Control': 'public, maxage=1, s-maxage=0, stale-while-revalidate=10' },
    },
  );
};

export default Index;

export const ErrorBoundary = ({ error }: { error: Error }) => {
  console.log('index -> ErrorBoundary', error);
  return (
    <>
      <Heading fontSize={['sm', 'md']}>Oops, unhandled error</Heading>
      <Text fontSize="sm">Trace(for debug): {error.message}</Text>
    </>
  );
};

export const CatchBoundary = () => {
  let caught = useCatch();
  let message;
  switch (caught.status) {
    case 401:
      message = <Text>Oops, you shouldn't be here (No access)</Text>;
      break;
    case 404:
      message = <Text>Oops, you shouldn't be here (Page doesn't exist)</Text>;
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <>
      <Heading fontSize={['sm', 'md']}>
        {caught.status}: {caught.statusText}
      </Heading>
      <Text fontSize="sm">{message}</Text>
    </>
  );
};
