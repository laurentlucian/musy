import { Avatar, Box, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import type { Profile as ProfileType } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { getUser, updateToken } from '~/services/auth.server';
import { spotifyApi } from '~/services/spotify.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const id = params.id;
  if (!id) throw redirect('/');
  const data = await getUser(id);

  // @todo(type-fix) data.user should never be null if data exists
  if (!data || !data.user) return { user: null, playback: null };

  const now = new Date();
  const isExpired = new Date(data.expiresAt) < now;
  const client = await spotifyApi(data.accessToken);
  if (isExpired) {
    console.log('Access Token expired');
    client.setRefreshToken(data.refreshToken);
    const { body } = await client.refreshAccessToken();
    client.setAccessToken(body.access_token);

    const expiresAt = Date.now() + body.expires_in * 1000;
    await updateToken(data.user.userId, body.access_token, expiresAt);
  }

  const { body: playback } = await client.getMyCurrentPlaybackState();

  return { user: data.user, playback };
};

const Profile = () => {
  const { user, playback } = useLoaderData<{ user: ProfileType; playback: SpotifyApi.CurrentPlaybackResponse }>();

  return (
    <Stack textAlign="center">
      {user ? (
        <>
          <HStack spacing={5}>
            <Avatar size="xl" src={user.image} />
            <Stack align="flex-start">
              <HStack>
                <Heading size="lg" fontWeight="bold">
                  {user.name}
                </Heading>
              </HStack>
              {playback.is_playing ? (
                <Stack align="flex-start">
                  {playback.item?.type === 'track' ? (
                    <Text>
                      {playback.item?.name} - {playback.item?.album?.name}
                    </Text>
                  ) : (
                    <Text>
                      {playback.item?.name} - {playback.item?.show.name}
                    </Text>
                  )}

                  <Text>{playback.device.name}</Text>
                </Stack>
              ) : (
                <Text>Not playing</Text>
              )}
            </Stack>
          </HStack>
        </>
      ) : (
        <Stack>
          <Heading size="md">404 Not Found</Heading>
          <Text>User not found</Text>
        </Stack>
      )}
    </Stack>
  );
};

export default Profile;

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
