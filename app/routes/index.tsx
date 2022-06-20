import { Avatar, Box, Button, Divider, Heading, HStack, Stack, Text } from '@chakra-ui/react';
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
      {data && (
        <>
          <Heading size="md">You</Heading>
          <HStack spacing={5}>
            <Avatar size="lg" src={data.user.images?.[0].url} />
            <Stack align="flex-start">
              <HStack>
                <Text fontWeight="bold">{data.user.display_name} - </Text>
                <Text>{data.user.followers?.total} followers</Text>
              </HStack>
              <Text>{data.user.email}</Text>
              {data.playback.is_playing ? (
                <Stack align="flex-start">
                  {data.playback.item?.type === 'track' ? (
                    <Text>
                      {data.playback.item?.name} - {data.playback.item?.album?.name}
                    </Text>
                  ) : (
                    <Text>
                      {data.playback.item?.name} - {data.playback.item?.show.name}
                    </Text>
                  )}

                  <Text>{data.playback.device.name}</Text>
                </Stack>
              ) : (
                <Text>Not playing</Text>
              )}
            </Stack>
          </HStack>
          <Divider />
        </>
      )}

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
