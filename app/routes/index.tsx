import { Button, Heading, Input, Stack, Text } from '@chakra-ui/react';
import type { LoaderArgs } from '@remix-run/node';
import { Form, useCatch, useTransition } from '@remix-run/react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import MiniPlayer from '~/components/MiniPlayer';

import { authenticator, getAllUsers } from '~/services/auth.server';
import { spotifyApi } from '~/services/spotify.server';

const Index = () => {
  const { user, users, playbacks } = useTypedLoaderData<typeof loader>();

  const transition = useTransition();

  return (
    <Stack>
      {users.map((user) => {
        const playback = playbacks.find((data) => data.userId === user.userId);
        return <MiniPlayer key={user.userId} user={user} playback={playback} />;
      })}
      {!user && (
        <Form action="/auth/spotify" method="post">
          <Input type="hidden" value="/" name="redirectTo" />
          <Button isLoading={transition.state === 'submitting'} type="submit">
            Join
          </Button>
        </Form>
      )}
    </Stack>
  );
};

export interface Playback extends SpotifyApi.CurrentPlaybackResponse {
  userId: string;
}

export const loader = async ({ request }: LoaderArgs) => {
  const users = await getAllUsers();
  const session = await authenticator.isAuthenticated(request);
  const user = session?.user ?? null;

  if (!users.length) return typedjson({ users, user, playbacks: [] });

  const getPlaybackState = async (id?: string) => {
    if (!id) return null;
    try {
      const { spotify } = await spotifyApi(id);
      if (!spotify) return null;
      try {
        const res = await spotify.getMyCurrentPlaybackState();
        const playback = res.body;
        if (!playback.is_playing) return null;
        return { userId: id, ...playback };
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  };

  let playbacks = [] as Playback[];
  // runs in sequence, rather than parallel (Promise.all); parallel creates a race condition when calling spotifyApi()
  for (const user of users) {
    const data = await getPlaybackState(user.userId);
    if (data) {
      playbacks.push(data);
    }
  }
  const isPlayingIds = playbacks.map((data) => data.userId);
  // place playingNow users at top; o(n) but n is small
  users.sort((a, b) => isPlayingIds.indexOf(b.userId) - isPlayingIds.indexOf(a.userId));

  return typedjson({ users, user, playbacks });
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
