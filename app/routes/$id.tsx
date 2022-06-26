import { useRef, useState } from 'react';
import {
  Heading,
  HStack,
  Stack,
  Text,
  Input,
  Flex,
  InputGroup,
  InputRightElement,
  Spinner,
  Image,
  IconButton,
} from '@chakra-ui/react';
import {
  Form,
  Outlet,
  useCatch,
  useLoaderData,
  useSearchParams,
  useSubmit,
  useTransition,
} from '@remix-run/react';
import { redirect } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import type { Party, Profile as ProfileType, Queue } from '@prisma/client';

import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';
import { getCurrentUser } from '~/services/auth.server';
import Player from '~/components/Player';
import Tile from '~/components/Tile';
import Tiles from '~/components/Tiles';
import { timeSince } from '~/hooks/utils';
import { CloseSquare, MusicSquareSearch } from 'iconsax-react';

type ProfileComponent = {
  user: ProfileType | null;
  playback: SpotifyApi.CurrentPlaybackResponse | null;
  recent: SpotifyApi.UsersRecentlyPlayedTracksResponse | null;
  liked: SpotifyApi.UsersSavedTracksResponse | null;
  top: SpotifyApi.UsersTopTracksResponse | null;
  currentUser: null;
  party: Party[];
  queue: Queue[];
};

const Profile = () => {
  const { user, playback, recent, currentUser, party, liked, top, queue } =
    useLoaderData<ProfileComponent>();

  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const transition = useTransition();
  const search = searchParams.get('spotify');
  const formRef = useRef<HTMLFormElement>(null);
  const busy = transition.submission?.formData.has('spotify') ?? false;
  // remove Outlet instantly, before new "empty search" completes
  const [isSearching, setIsSearching] = useState(search ? true : false);

  const duration = playback?.item?.duration_ms ?? 0;
  const progress = playback?.progress_ms ?? 0;
  return (
    <Stack spacing={5} pb={5}>
      {user ? (
        <>
          <Stack spacing={3}>
            <HStack>
              <Image borderRadius={50} boxSize={93} src={user.image} />
              <Heading size="lg" fontWeight="bold">
                {user.name}
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
                explicit={playback.item?.explicit}
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
                explicit={playback?.item?.explicit}
              />
            ) : null}
          </Stack>

          <Stack spacing={5}>
            {playback?.is_playing && (
              <Form ref={formRef} method="get" action="search">
                <Flex flex={1} align="center">
                  {!isSearching && (
                    <>
                      <Heading fontSize={['md', 'lg']} mr={2}>
                        Queue
                      </Heading>
                      <IconButton
                        aria-label="Add to Queue"
                        icon={<MusicSquareSearch size="20px" />}
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsSearching(true);
                          searchParams.delete('spotify');
                          setSearchParams(searchParams, {
                            replace: true,
                            state: { scroll: false },
                          });
                        }}
                      />
                    </>
                  )}
                  {isSearching && (
                    <InputGroup>
                      <Input
                        name="spotify"
                        variant="flushed"
                        autoComplete="off"
                        autoFocus
                        size="sm"
                        defaultValue={search ?? ''}
                        placeholder="joji, willow, ribs, etc"
                        // onBlur={() => setIsSearching(false)}
                        onChange={(e) => {
                          if (e.currentTarget.value.trim()) {
                            submit(e.currentTarget.form);
                            setIsSearching(true);
                          } else {
                            setIsSearching(false);
                            searchParams.delete('spotify');
                            setSearchParams(searchParams, {
                              replace: true,
                              state: { scroll: false },
                            });
                          }
                        }}
                      />
                      <InputRightElement
                        h="35px"
                        w="65px"
                        pr={2}
                        justifyContent="end"
                        children={
                          <>
                            {busy && <Spinner size="xs" mr={2} />}
                            <CloseSquare
                              onClick={() => {
                                setIsSearching(false);
                                searchParams.delete('spotify');
                                setSearchParams(searchParams, {
                                  replace: true,
                                  state: { scroll: false },
                                });
                              }}
                            />
                          </>
                        }
                      />
                    </InputGroup>
                  )}
                </Flex>
              </Form>
            )}
            {isSearching && <Outlet />}
            {!isSearching && queue.length !== 0 && (
              <Tiles>
                {queue.map((songs) => (
                  <Tile
                    key={songs.id}
                    uri={'hi'}
                    image={songs.image}
                    name={songs.trackName}
                    artist={songs.artist}
                    explicit={songs.explicit}
                  />
                ))}
              </Tiles>
            )}
          </Stack>
          {/* object exists? object.item has tracks? note: !== 0 needed otherwise "0" is rendered on screen*/}
          {recent && recent?.items.length !== 0 && (
            <Stack spacing={5}>
              <Heading fontSize={['md', 'lg']}>Recently played</Heading>
              <Tiles>
                {recent?.items.map(({ track, played_at }) => {
                  return (
                    <Tile
                      // in case song is on repeat
                      key={played_at}
                      uri={track.uri}
                      image={track.album.images[1].url}
                      name={track.name}
                      artist={track.album.artists[0].name}
                      explicit={track.explicit}
                    />
                  );
                })}
              </Tiles>
            </Stack>
          )}
          {liked && liked?.items.length !== 0 && (
            <Stack spacing={5}>
              <Heading fontSize={['md', 'lg']}>Recently liked</Heading>
              <Tiles>
                {liked.items.map(({ track }) => {
                  return (
                    <Tile
                      key={track.id}
                      uri={track.uri}
                      image={track.album.images[1].url}
                      name={track.name}
                      artist={track.album.artists[0].name}
                      explicit={track.explicit}
                    />
                  );
                })}
              </Tiles>
            </Stack>
          )}
          {top && top?.items.length !== 0 && (
            <Stack spacing={5}>
              <Heading fontSize={['md', 'lg']}>Top</Heading>
              <Tiles>
                {top.items.map((track) => {
                  return (
                    <Tile
                      key={track.id}
                      uri={track.uri}
                      image={track.album.images[1].url}
                      name={track.name}
                      artist={track.album.artists[0].name}
                      explicit={track.explicit}
                    />
                  );
                })}
              </Tiles>
            </Stack>
          )}
        </>
      ) : (
        <>
          <Heading size="md">404</Heading>
          <Text>User not found</Text>
        </>
      )}
    </Stack>
  );
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const id = params.id;
  if (!id) throw redirect('/');
  const { spotify, user } = await spotifyApi(id);

  if (!spotify)
    return {
      user: null,
      playback: null,
      recent: null,
      party: null,
      currentUser: null,
      liked: null,
      top: null,
    };

  const queue = await prisma.queue.findMany({ where: { ownerId: id } });
  const party = await prisma.party.findMany({ where: { ownerId: id } });
  const { body: playback } = await spotify.getMyCurrentPlaybackState();
  const { body: recent } = await spotify.getMyRecentlyPlayedTracks();
  const { body: liked } = await spotify.getMySavedTracks();
  const currentUser = await getCurrentUser(request);

  try {
    const { body: top } = await spotify.getMyTopTracks();
    return { user, playback, recent, party, currentUser, liked, top, queue };
  } catch {
    // will catch error if existingUser doesn't have required scopes in spotify authorization
    // user needs to reauthenticate
    return { user, playback, recent, party, currentUser, liked, queue, top: null };
  }
};

export const ErrorBoundary = (error: { error: Error }) => {
  console.log('error', error);
  return (
    <>
      <Heading fontSize={['xl', 'xxl']}>401</Heading>
      {/* error message useless (might be because of spotify stragegy) */}
      {/* <Text fontSize="md">Trace(for debug): {JSON.stringify(error, null, 2)} </Text> */}
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
      <Heading fontSize={['xl', 'xxl']}>
        {caught.status}: {caught.statusText}
      </Heading>
      <Text fontSize="md">{message}</Text>
    </>
  );
};

export default Profile;
