import { useState } from 'react';
import { Heading, HStack, Stack, Text, Image, Textarea } from '@chakra-ui/react';
import {
  Form,
  Outlet,
  useCatch,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import type { LoaderFunction, ActionFunction } from '@remix-run/node';
import type { Party, Profile as ProfileType } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';
import { getCurrentUser } from '~/services/auth.server';
import Player from '~/components/Player';
import Tile from '~/components/Tile';
import Tiles from '~/components/Tiles';
import { timeSince } from '~/hooks/utils';
import Search from '~/components/Search';

const queueWithProfile = Prisma.validator<Prisma.QueueArgs>()({
  include: { user: true },
});

type QueueWithProfile = Prisma.QueueGetPayload<typeof queueWithProfile>;

type ProfileComponent = {
  user: ProfileType;
  playback: SpotifyApi.CurrentPlaybackResponse;
  recent: SpotifyApi.UsersRecentlyPlayedTracksResponse;
  liked: SpotifyApi.UsersSavedTracksResponse;
  top: SpotifyApi.UsersTopTracksResponse;
  currentUser: ProfileType | null;
  party: Party[];
  queue: QueueWithProfile[];
};

const Profile = () => {
  const { user, playback, recent, currentUser, party, liked, top, queue } =
    useLoaderData<ProfileComponent>();

  const [searchParams] = useSearchParams();
  const searchDefault = searchParams.get('spotify');
  const [search, setSearch] = useState(searchDefault ?? '');

  const submit = useSubmit();

  const duration = playback?.item?.duration_ms ?? 0;
  const progress = playback?.progress_ms ?? 0;
  return (
    <Stack spacing={5} pb={5}>
      {user ? (
        <>
          <Stack spacing={3}>
            <HStack>
              <Image borderRadius={50} boxSize={93} src={user.image} />
              <Stack flex={1} maxW="calc(100% - 100px)">
                <Heading size="md" fontWeight="bold">
                  {user.name}
                </Heading>
                {user.id === currentUser?.id ? (
                  <Form method="post" replace>
                    <Textarea
                      name="bio"
                      size="sm"
                      variant="flushed"
                      defaultValue={user.bio ?? ''}
                      placeholder="write something :)"
                      onBlur={(e) => submit(e.currentTarget.form)}
                      resize="none"
                      maxLength={75}
                      rows={2}
                      py={0}
                      focusBorderColor="purple.500"
                    />
                  </Form>
                ) : (
                  <Text fontSize="14px" noOfLines={3} whiteSpace="normal">
                    {user.bio}
                  </Text>
                )}
              </Stack>
            </HStack>
            {playback?.item ? (
              <Player
                uri={playback.item.uri}
                id={user.userId}
                name={playback.item.name}
                artist={
                  playback.item.type === 'track'
                    ? playback.item.album?.artists[0].name
                    : playback.item.show.name
                }
                image={
                  playback.item.type === 'track'
                    ? playback.item.album?.images[0].url
                    : playback.item.images[0].url
                }
                device={playback.device.name}
                currentUser={currentUser}
                party={party}
                active={playback.is_playing}
                progress={progress}
                duration={duration}
                explicit={playback.item.explicit}
              />
            ) : (
              <Player
                uri={recent.items[0].track.uri}
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
                explicit={recent.items[0].track.explicit}
              />
            )}
          </Stack>

          <Stack spacing={5}>
            {currentUser?.id !== user.id && <Search search={search} setSearch={setSearch} />}
            {search && <Outlet />}

            {queue.length !== 0 && (
              <Stack spacing={3}>
                <Heading fontSize={['sm', 'md']}>Activity</Heading>
                <Tiles>
                  {queue.map((item) => {
                    return (
                      <Tile
                        key={new Date(item.createdAt).getMilliseconds()}
                        uri={item.uri}
                        image={item.image}
                        name={item.name}
                        artist={item.artist}
                        explicit={item.explicit}
                        user={item.user}
                      />
                    );
                  })}
                </Tiles>
              </Stack>
            )}
          </Stack>
          {/* object exists? object.item has tracks? note: !== 0 needed otherwise "0" is rendered on screen*/}
          {recent && recent?.items.length !== 0 && (
            <Stack spacing={3}>
              <Heading fontSize={['sm', 'md']}>Recently played</Heading>
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
                      userId={currentUser?.userId}
                    />
                  );
                })}
              </Tiles>
            </Stack>
          )}
          {liked && liked?.items.length !== 0 && (
            <Stack spacing={3}>
              <Heading fontSize={['sm', 'md']}>Recently liked</Heading>
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
                      userId={currentUser?.userId}
                    />
                  );
                })}
              </Tiles>
            </Stack>
          )}
          {top && top?.items.length !== 0 && (
            <Stack spacing={3}>
              <Heading fontSize={['sm', 'md']}>Top</Heading>
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
                      userId={currentUser?.userId}
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

  if (!spotify || !user) return json('Spotify API Error', 500);

  const queue = await prisma.queue.findMany({ where: { ownerId: id }, include: { user: true } });
  const party = await prisma.party.findMany({ where: { ownerId: id } });
  const { body: playback } = await spotify.getMyCurrentPlaybackState();
  const { body: recent } = await spotify.getMyRecentlyPlayedTracks();
  const { body: liked } = await spotify.getMySavedTracks();
  const currentUser = await getCurrentUser(request);

  try {
    const { body: top } = await spotify.getMyTopTracks();
    return json({ user, playback, recent, party, currentUser, liked, top, queue });
  } catch {
    // will catch error if existingUser doesn't have required scopes in spotify authorization
    // user needs to reauthenticate
    return json({ user, playback, recent, party, currentUser, liked, queue, top: null });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const id = params.id;
  if (!id) throw redirect('/');
  const data = await request.formData();
  const bio = data.get('bio');

  if (typeof bio !== 'string') {
    return json('Form submitted incorrectly');
  }

  const user = await prisma.profile.update({ where: { userId: id }, data: { bio: bio ?? '' } });
  return user;
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
