import { Avatar, Flex, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { Session } from 'remix-auth-spotify';

import { spotifyStrategy } from '~/services/auth.server';
import type { SpotifyPlayerStatus } from '~/lib/types/spotify';

export const loader: LoaderFunction = async ({ request }) => {
  const session = await spotifyStrategy.getSession(request);

  if (session) {
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const res: SpotifyPlayerStatus = await response.json();
    return { session, state: res };
  }

  return null;
};

export default function Index() {
  const data = useLoaderData<{ session: Session; state: SpotifyPlayerStatus }>();
  const user = data?.session.user;

  return (
    <Flex textAlign="center" p={20}>
      {user && (
        <HStack spacing={5}>
          <Avatar size="lg" src={user.image} />
          <Stack align="flex-start">
            <Heading size="md">{user.name}</Heading>
            {data?.state.is_playing && (
              <>
                <Text>
                  {data.state.item.name} - {data.state.item.album.artists[0].name}
                </Text>
                <Text>{data.state.device.name}</Text>
              </>
            )}
          </Stack>
        </HStack>
      )}
    </Flex>
  );
}
