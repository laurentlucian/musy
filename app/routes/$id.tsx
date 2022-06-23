import { useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Heading,
  HStack,
  Stack,
  Text,
  Input,
  Flex,
  InputGroup,
  InputRightElement,
  Spinner,
} from '@chakra-ui/react';
import {
  Form,
  Outlet,
  useLoaderData,
  useSearchParams,
  useSubmit,
  useTransition,
} from '@remix-run/react';
import { CloseSquare } from 'iconsax-react';
import { redirect } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import type { Party, Profile as ProfileType } from '@prisma/client';

import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';
import { getCurrentUser } from '~/services/auth.server';
import Player from '~/components/Player';
import Tile from '~/components/Tile';
import Tiles from '~/components/Tiles';
import { timeSince } from '~/hooks/utils';

const Profile = () => {
  const { user, playback, recent, currentUser, party } = useLoaderData<{
    user: ProfileType | null;
    playback: SpotifyApi.CurrentPlaybackResponse | null;
    recent: SpotifyApi.UsersRecentlyPlayedTracksResponse | null;
    currentUser: ProfileType | null;
    party: Party[];
  }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const transition = useTransition();
  const duration = playback?.item?.duration_ms ?? 0;
  const progress = playback?.progress_ms ?? 0;

  const search = searchParams.get('spotify');
  // remove Outlet instantly, before new "empty search" completes
  const [isSearching, setisSearching] = useState(search ? true : false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Stack spacing={4}>
      {user ? (
        <>
          <Stack spacing={7}>
            <HStack>
              <Avatar size="xl" boxSize={93} src={user.image} />
              <Heading size="lg" fontWeight="bold">
                {user.name}
                {/* {user.bio} */}
              </Heading>
            </HStack>
            {playback?.is_playing ? (
              <Player
                id={user.userId}
                name={playback.item?.name}
                artist={
                  playback.item?.type === 'track' ? playback.item?.album?.artists[0].name : ''
                }
                image={playback.item?.type === 'track' ? playback.item.album?.images[0].url : ''}
                device={playback.device.name}
                currentUser={currentUser}
                party={party}
                active={true}
                progress={progress}
                duration={duration}
              />
            ) : recent ? (
              <Player
                id={user.userId}
                name={recent.items[0].track.name}
                artist={recent.items[0].track.artists[0].name}
                image={recent.items[0].track.album.images[1].url}
                device={timeSince(new Date(recent.items[0].played_at)) + ' ago'}
                currentUser={currentUser}
                party={party}
                active={false}
                progress={progress}
                duration={duration}
              />
            ) : null}
          </Stack>
          <Stack spacing={5}>
            <Form ref={formRef} method="get" action="search">
              <Flex flex={1}>
                <InputGroup>
                  <Input
                    name="spotify"
                    h="35px"
                    defaultValue={search ?? ''}
                    placeholder="Add to queue"
                    autoComplete="off"
                    borderRadius={3}
                    onChange={(e) => {
                      if (e.currentTarget.value.trim()) {
                        submit(e.currentTarget.form);
                        setisSearching(true);
                      } else {
                        setisSearching(false);
                        searchParams.delete('spotify');
                        setSearchParams(searchParams);
                      }
                    }}
                    fontSize="15px"
                  />
                  <InputRightElement
                    h="35px"
                    w="65px"
                    pr={2}
                    justifyContent="end"
                    children={
                      <>
                        {transition.state === 'submitting' && <Spinner size="xs" mr={5} />}
                        {transition.state === 'loading' && <Spinner size="xs" mr={5} />}
                        {isSearching && (
                          <CloseSquare
                            onClick={() => {
                              setisSearching(false);
                              searchParams.delete('spotify');
                              setSearchParams(searchParams);
                              formRef?.current?.reset();
                            }}
                          />
                        )}
                      </>
                    }
                  />
                </InputGroup>
              </Flex>
            </Form>
            {isSearching && <Outlet />}

            {/* <HStack>
              <Heading fontSize={20}>Queue</Heading>
              <IconButton
                aria-label="add"
                to={`/${user.userId}/search`}
                as={Link}
                icon={<Add />}
                variant="ghost"
              />
            </HStack>
            <Tiles>
              {recent?.items.map(({ track, played_at }) => {
                return (
                  <Tile
                    // if use track.id then key will be repeated if user replays a song
                    key={played_at}
                    image={track.album.images[1].url}
                    name={track.name}
                    artist={track.album.artists[0].name}
                  />
                );
              })}
            </Tiles> */}
          </Stack>
          <Stack spacing={5}>
            <Heading size="md">Recently played</Heading>
            <Tiles>
              {recent?.items.map(({ track, played_at }) => {
                return (
                  <Tile
                    key={played_at}
                    uri={track.uri}
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
          <Heading size="md">404</Heading>
          <Text>User not found</Text>
        </Stack>
      )}
    </Stack>
  );
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const id = params.id;
  if (!id) throw redirect('/');
  const { spotify, user } = await spotifyApi(id);

  if (!spotify) return { user: null, playback: null, recent: null, party: null, currentUser: null };

  const party = await prisma.party.findMany({ where: { ownerId: id } });
  const { body: playback } = await spotify.getMyCurrentPlaybackState();
  const { body: recent } = await spotify.getMyRecentlyPlayedTracks();

  const currentUser = await getCurrentUser(request);

  return { user, playback, recent, party, currentUser };
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
        Something is really wrong!{' >:('}
      </Heading>
      <Box color="white" fontSize={22}>
        {error.message}
      </Box>
    </Box>
  );
};
