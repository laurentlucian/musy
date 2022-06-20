import { Avatar, Box, Button, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { Form, Link, useLoaderData, useTransition } from '@remix-run/react';
import type { Session } from 'remix-auth-spotify';

import { getAllUsers, spotifyStrategy } from '~/services/auth.server';
import { spotifyApi } from '~/services/spotify.server';

export const loader: LoaderFunction = async ({ request }) => {
  const session = await spotifyStrategy.getSession(request);
  const users = await getAllUsers();

  if (!session) return { users, auth: null };

  const client = await spotifyApi(session.accessToken);
  const { body: user } = await client.getMe();
  const { body: playback } = await client.getMyCurrentPlaybackState();
  return { users, auth: { user, playback, session } };
};

const Index = () => {
  const loader = useLoaderData<{
    auth: {
      session: Session;
      user: SpotifyApi.CurrentUsersProfileResponse;
      playback: SpotifyApi.CurrentPlaybackResponse;
    } | null;
    users: Profile[];
  }>();
  const transition = useTransition();
  const data = loader.auth;

  return (
    <Stack textAlign="center" spacing={10}>
      <Stack>
        {loader.users.map((user) => {
          return (
            <Button as={Link} to={`/${user.userId}`} key={user.userId} variant="ghost" h="70px">
              <HStack spacing={3} w="100%">
                <Avatar src={user.image} size="md" />
                <Text fontWeight="bold">{user.name}</Text>
              </HStack>
            </Button>
          );
        })}
        {!data && (
          <Form action={'/auth/spotify'} method="post">
            <Button isLoading={transition.state === 'submitting'} type="submit">
              Join
            </Button>
          </Form>
        )}
      </Stack>
    </Stack>
  );
};

export default Index;

export const CatchBoundary = () => {
  return (
    <Box>
      <Heading as="h2">I caught some condition</Heading>
    </Box>
  );
};

export const ErrorBoundary = ({ error }: any) => {
  return (
    <Box bg="red.400" px={4} py={2}>
      <Heading as="h3" size="lg" color="white">
        Something is really wrong!
      </Heading>
      <Box color="white" fontSize={22}>
        {error.message}
      </Box>
    </Box>
  );
};
