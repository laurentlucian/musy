import { Avatar, Box, Heading, HStack, Image, Progress, Stack, Text } from '@chakra-ui/react';
import type { Profile as ProfileType } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { useDataRefresh } from 'remix-utils';
import Tile from '~/components/Tile';
import Tiles from '~/components/Tiles';

import { getUser, updateToken } from '~/services/auth.server';
import { spotifyApi } from '~/services/spotify.server';
import { useHorizontalScroll } from '~/utils';

const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<() => void>(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => {
      savedCallback.current();
    };
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

const Profile = () => {
  const { user, playback, recent } = useLoaderData<{
    user: ProfileType;
    playback: SpotifyApi.CurrentPlaybackResponse;
    recent: SpotifyApi.UsersRecentlyPlayedTracksResponse;
  }>();
  let { refresh } = useDataRefresh();
  const [progress, setProgress] = useState(0);
  const duration = playback.item?.duration_ms;
  const percentage = duration ? (progress / duration) * 100 : 0;

  useEffect(() => {
    const _progress = playback.progress_ms;
    if (_progress) {
      setProgress(_progress);
    }
  }, [playback]);

  useInterval(() => {
    if (!duration) return null;
    if (progress > duration) {
      refresh();
    }
    setProgress((prev) => prev + 1000);
  }, 1000);

  return (
    <Stack spacing={10} w={['100vw', '550px']}>
      {user ? (
        <>
          <Stack spacing={7}>
            <HStack>
              <Avatar size="xl" boxSize={93} src={user.image} />
              <Heading size="lg" fontWeight="bold">
                {user.name}
                {/*user.bio*/}
              </Heading>
            </HStack>
            {playback.is_playing ? (
              <Stack w={[363, '100%']} bg="#101010" spacing={0} borderRadius={5}>
                <HStack h={['112']} spacing={2} px="2px" py="2px" justify="space-between">
                  {playback.item?.type === 'track' ? (
                    <>
                      <Stack pl="7px" pt="7px" py={0} spacing={1} h="100%" w="100%">
                        <Text>{playback.item?.name}</Text>
                        <Text opacity={0.8} fontSize="13px">
                          {playback.item?.album?.artists[0].name}
                        </Text>
                        <Text>{playback.device.name}</Text>
                      </Stack>
                      <Image src={playback.item?.album.images[1].url} m={0} boxSize={108} borderRadius={2} />
                    </>
                  ) : (
                    <Text>
                      {playback.item?.name} - {playback.item?.show.name}
                    </Text>
                  )}
                </HStack>
                <Progress
                  sx={{
                    '> div': {
                      backgroundColor: 'white',
                    },
                  }}
                  borderBottomLeftRadius={2}
                  borderBottomRightRadius={2}
                  size="sm"
                  height="2px"
                  value={percentage}
                />
              </Stack>
            ) : (
              <Stack w={[363, '100%']} bg="#101010" spacing={0} borderRadius={5}>
                <HStack h={['112']} spacing={2} px="2px" py="2px" justify="space-between">
                  {playback.item?.type != 'track' && (
                    <>
                      <Stack pl="7px" pt="7px" py={0} spacing={1} h="100%" w="100%">
                        <Text>{recent.items[0].track.name}</Text>
                        <Text opacity={0.8} fontSize="13px">
                          {recent.items[0].track.artists[0].name}
                        </Text>
                      </Stack>
                      <Image src={recent.items[0].track.album.images[1].url} m={0} boxSize={108} borderRadius={2} />
                    </>
                  )}
                </HStack>
                <Progress
                  sx={{
                    '> div': {
                      backgroundColor: 'white',
                    },
                  }}
                  borderBottomLeftRadius={2}
                  borderBottomRightRadius={2}
                  size="sm"
                  height="2px"
                  value={percentage}
                />
              </Stack>
            )}
          </Stack>
          <Stack spacing={5}>
            <Heading fontSize={20}>Queue +</Heading>
            <Tiles>
              {recent.items.map(({ track }) => {
                return (
                  <Tile
                    key={track.id}
                    image={track.album.images[1].url}
                    name={track.name}
                    artist={track.album.artists[0].name}
                  />
                );
              })}
            </Tiles>
          </Stack>
          <Stack spacing={5}>
            <Heading size="md">Recently played</Heading>
            <Tiles>
              {recent.items.map(({ track }) => {
                return (
                  <Tile
                    key={track.id}
                    image={track.album.images[1].url}
                    name={track.name}
                    artist={track.album.artists[0].name}
                  />
                );
              })}
            </Tiles>
          </Stack>
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
  const { body: recent } = await client.getMyRecentlyPlayedTracks();

  return { user: data.user, playback, recent };
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
