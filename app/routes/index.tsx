import { Avatar, HStack, Stack, Text } from '@chakra-ui/react';
import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { Session } from 'remix-auth-spotify';

import { spotifyStrategy } from '~/services/auth.server';
import type { SpotifyPlayerStatus } from '~/lib/types/spotify';
import useSpotifyClient from '~/hooks/useSpotifyClient';
import { useEffect, useState } from 'react';

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
  const client = useSpotifyClient();
  const [me, setMe] = useState<SpotifyApi.CurrentUsersProfileResponse>();
  const user = data?.session.user;

  const fetchMe = async () => {
    const newMe = await client.getMe();
    setMe(newMe);
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <Stack textAlign="center" p={20}>
      {me && (
        <HStack spacing={5}>
          <Avatar size="lg" src={me.images?.[0].url} />
          <Stack align="flex-start">
            <HStack>
              <Text fontWeight="bold">{me.display_name} - </Text>
              <Text>{me.followers?.total} followers</Text>
            </HStack>
            <Text>{me.email}</Text>
            {user && (
              <Stack align="flex-start">
                {data?.state.is_playing && (
                  <>
                    <Text>
                      {data.state.item.name} - {data.state.item.album.artists[0].name}
                    </Text>
                    <Text>{data.state.device.name}</Text>
                  </>
                )}
              </Stack>
            )}
          </Stack>
        </HStack>
      )}
    </Stack>
  );
}
