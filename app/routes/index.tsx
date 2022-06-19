import { Avatar, Box, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { Session } from 'remix-auth-spotify';

import { spotifyStrategy } from '~/services/auth.server';
import { spotifyApi } from '~/services/spotify.server';

export const loader: LoaderFunction = async ({ request }) => {
  const session = await spotifyStrategy.getSession(request);
  const client = await spotifyApi(request);

  if (session && client) {
    const { body: user } = await client.getMe();
    const { body: playback } = await client.getMyCurrentPlaybackState();
    return { session, user, playback };
  }

  return null;
};

export default function Index() {
  const data = useLoaderData<{
    session: Session;
    user: SpotifyApi.CurrentUsersProfileResponse;
    playback: SpotifyApi.CurrentPlaybackResponse;
  }>();

  return (
    <Stack textAlign="center" p={20}>
      {data && (
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
      )}
    </Stack>
  );
}

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
