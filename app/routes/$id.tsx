import { Heading, HStack, Stack, Text, Image, Textarea, Button } from '@chakra-ui/react';
import { Form, Link, useCatch, useSubmit } from '@remix-run/react';
import type { MetaFunction, ActionArgs, LoaderArgs } from '@remix-run/node';

import { prisma } from '~/services/db.server';
import { getUserQueue, spotifyApi } from '~/services/spotify.server';
import { getCurrentUser, updateUserImage } from '~/services/auth.server';
import Player from '~/components/Player';
import Tile from '~/components/Tile';
import Tiles from '~/components/Tiles';
import Search from '~/components/Search';
import Following from '~/components/Following';
import PlayerPaused from '~/components/PlayerPaused';
import PlayingFrom from '~/components/PlayingFrom';
import Tooltip from '~/components/Tooltip';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';
import MiniTile from '~/components/MiniTile';
import loading from '~/lib/styles/loading.css';

export const links = () => {
  return [{ rel: 'stylesheet', href: loading }];
};

const Profile = () => {
  const { user, playback, recent, currentUser, party, liked, top, activity, following, queue } =
    useTypedLoaderData<typeof loader>();
  const submit = useSubmit();

  return (
    <Stack spacing={5} pb={5} pt={5} h="max-content">
      <HStack>
        <Tooltip label="<3" placement="top">
          <Image borderRadius="100%" boxSize={[150, 150, 200]} src={user.image} />
        </Tooltip>
        <Stack
          flex={1}
          maxW="calc(100% - 100px)"
          pl={user.name.length > 10 ? '15px' : user.name.length > 16 ? '0px' : '23px'}
        >
          <HStack>
            <Heading
              size={user.name.length > 10 ? 'lg' : user.name.length > 16 ? 'md' : 'xl'}
              fontWeight="bold"
            >
              {user.name}
            </Heading>
            {currentUser && following !== null && (
              <Following currentUser={currentUser} user={user} following={following} />
            )}
          </HStack>

          {user.id === currentUser?.id ? (
            <Form method="post" replace>
              <Textarea
                name="bio"
                size="md"
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
            <Text fontSize="14px" noOfLines={3} whiteSpace="normal" zIndex={-2}>
              {user.bio}
            </Text>
          )}
        </Stack>
      </HStack>
      {playback && playback.item?.type === 'track' ? (
        <Player
          id={user.userId}
          currentUser={currentUser}
          party={party}
          playback={playback}
          item={playback.item}
        />
      ) : (
        <PlayerPaused item={recent.items[0].track} />
      )}
      {currentUser?.id !== user.id && <Search />}
      {queue.length !== 0 && (
        <HStack align='flex-start'>
          <Stack>
            {playback && playback.item?.type === 'track' && (
              <PlayingFrom playback={playback} item={playback.item} />
            )}
          </Stack>
          <Stack>
          {activity.length !== 0 && (
          <Stack>
            <Heading fontSize={['xs', 'sm']}>Activity</Heading>
            <Tiles>
              {activity.map((item) => {
                return (
                  <MiniTile
                    key={item.id}
                    uri={item.uri}
                    image={item.image}
                    albumUri={item.albumUri}
                    albumName={item.albumName}
                    name={item.name}
                    artist={item.artist}
                    artistUri={item.artistUri}
                    explicit={item.explicit}
                    user={currentUser}
                    createdBy={item.user}
                    createdAt={item.createdAt}
                  />
                );
              })}
            </Tiles>
          </Stack>
        )}
            <Heading fontSize={['xs', 'sm']}>Up Next</Heading>
            <Tiles>
              {queue.map((track, index) => {
                return (
                  <MiniTile
                    key={index}
                    uri={track.uri}
                    image={track.album.images[1].url}
                    albumUri={track.album.uri}
                    albumName={track.album.name}
                    name={track.name}
                    artist={track.album.artists[0].name}
                    artistUri={track.album.artists[0].uri}
                    explicit={track.explicit}
                    user={currentUser}
                  />
                );
              })}
            </Tiles>
            
          </Stack>
        </HStack>
      )}
      <Stack spacing={5}>
        {/* {activity.length !== 0 && (
          <Stack>
            <Heading fontSize={['xs', 'sm']}>Activity</Heading>
            <Tiles>
              {activity.map((item) => {
                return (
                  <MiniTile
                    key={item.id}
                    uri={item.uri}
                    image={item.image}
                    albumUri={item.albumUri}
                    albumName={item.albumName}
                    name={item.name}
                    artist={item.artist}
                    artistUri={item.artistUri}
                    explicit={item.explicit}
                    user={currentUser}
                    createdBy={item.user}
                    createdAt={item.createdAt}
                  />
                );
              })}
            </Tiles>
          </Stack>
        )} */}
      </Stack>
      {/* object exists? object.item has tracks? note: !== 0 needed otherwise "0" is rendered on screen*/}
      {recent && recent?.items.length !== 0 && (
        <Stack spacing={3}>
          <Heading fontSize={['xs', 'sm']}>Recently played</Heading>
          <Tiles>
            {recent?.items.map(({ track, played_at }) => {
              return (
                <Tile
                  // in case song is on repeat
                  key={played_at}
                  uri={track.uri}
                  image={track.album.images[1].url}
                  albumUri={track.album.uri}
                  albumName={track.album.name}
                  name={track.name}
                  artist={track.album.artists[0].name}
                  artistUri={track.album.artists[0].uri}
                  explicit={track.explicit}
                  user={currentUser}
                />
              );
            })}
          </Tiles>
        </Stack>
      )}
      {liked && liked?.items.length !== 0 && (
        <Stack spacing={3}>
          <Heading fontSize={['xs', 'sm']}>Recently liked</Heading>
          <Tiles>
            {liked.items.map(({ track }) => {
              return (
                <Tile
                  key={track.id}
                  uri={track.uri}
                  image={track.album.images[1].url}
                  albumUri={track.album.uri}
                  albumName={track.album.name}
                  name={track.name}
                  artist={track.album.artists[0].name}
                  artistUri={track.album.artists[0].uri}
                  explicit={track.explicit}
                  user={currentUser}
                />
              );
            })}
          </Tiles>
        </Stack>
      )}
      {top && top?.items.length !== 0 && (
        <Stack spacing={3}>
          <Heading fontSize={['xs', 'sm']}>Top</Heading>
          <Tiles>
            {top.items.map((track) => {
              return (
                <Tile
                  key={track.id}
                  uri={track.uri}
                  image={track.album.images[1].url}
                  albumUri={track.album.uri}
                  albumName={track.album.name}
                  name={track.name}
                  artist={track.album.artists[0].name}
                  artistUri={track.album.artists[0].uri}
                  explicit={track.explicit}
                  user={currentUser}
                />
              );
            })}
          </Tiles>
        </Stack>
      )}
    </Stack>
  );
};

export const meta: MetaFunction = (props) => {
  return {
    title: `Musy - ${props.data?.user?.name.split(' ')[0] ?? ''}`,
  };
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const profile = await prisma.user.findUnique({ where: { id }, include: { user: true } });
  if (!profile || !profile.user) throw new Response('Not found', { status: 404 });
  const user = profile.user;

  const { spotify } = await spotifyApi(id).catch(() => {
    throw new Response('User Access Revoked', { status: 401 });
  });
  if (!spotify) {
    throw new Response('User Access Revoked', { status: 401 });
  }

  const spotifyProfile = await spotify.getMe();
  const pfp = spotifyProfile.body.images;
  if (pfp) {
    await updateUserImage(id, pfp[0].url);
  }

  const [
    activity,
    party,
    { body: recent },
    { body: liked },
    { body: top },
    { currently_playing: playback, queue },
  ] = await Promise.all([
    prisma.queue.findMany({
      where: { ownerId: id },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.party.findMany({ where: { ownerId: id } }),
    spotify.getMyRecentlyPlayedTracks(),
    spotify.getMySavedTracks(),
    spotify.getMyTopTracks().catch(() => ({
      body: null,
    })),
    getUserQueue(id),
  ]);

  const currentUser = await getCurrentUser(request);
  if (currentUser) {
    const { spotify: cUserSpotify } = await spotifyApi(currentUser.userId);
    if (cUserSpotify) {
      const {
        body: [following],
      } = await cUserSpotify.isFollowingUsers([id]);
      return typedjson({
        user,
        activity,
        party,
        playback,
        recent,
        liked,
        top,
        currentUser,
        following,
        queue,
      });
    }
  }

  return typedjson({
    user,
    activity,
    party,
    playback,
    recent,
    liked,
    top,
    currentUser,
    following: null,
    queue,
  });
};

export const action = async ({ request, params }: ActionArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const data = await request.formData();
  const bio = data.get('bio');
  const follow = data.get('Follow');
  const unFollow = data.get('Unfollow');
  const currentUser = await getCurrentUser(request);

  if (unFollow != null && currentUser) {
    const cid = currentUser?.userId;
    const { spotify } = await spotifyApi(cid);
    await spotify?.unfollowUsers([id]);
  }

  if (follow != null && currentUser) {
    const cid = currentUser?.userId;
    const { spotify } = await spotifyApi(cid);
    await spotify?.followUsers([id]);
  }

  if (typeof bio !== 'string') {
    return typedjson('Form submitted incorrectly');
  }
  const user = await prisma.profile.update({ where: { userId: id }, data: { bio: bio ?? '' } });
  return user;
};

export const ErrorBoundary = (error: { error: Error }) => {
  console.log('$id -> ErrorBoundary', error);

  return (
    <>
      <Heading fontSize={['xl', 'xxl']}>500</Heading>
      <Text fontSize="md">oops something broke;</Text>
    </>
  );
};

export const CatchBoundary = () => {
  let caught = useCatch();
  switch (caught.status) {
    case 401:
      break;
    case 404:
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <>
      <Heading fontSize={['xl', 'xxl']}>
        {caught.status} {caught.data}
      </Heading>
      <Button mt={4} as={Link} to="/">
        Go home
      </Button>
    </>
  );
};

// remix.run/docs/en/v1/api/conventions#unstable_shouldreload
// export function unstable_shouldReload({ submission }: { submission: Submission }) {
//   return !!submission && submission.method !== 'GET';
// }

export default Profile;
