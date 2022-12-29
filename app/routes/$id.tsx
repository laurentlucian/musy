import {
  Heading,
  HStack,
  Stack,
  Text,
  Image,
  Textarea,
  Button,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { Form, Link, useCatch, useSubmit } from '@remix-run/react';
import type { MetaFunction, ActionArgs, LoaderArgs } from '@remix-run/node';
import { prisma } from '~/services/db.server';
import { getUserQueue, spotifyApi } from '~/services/spotify.server';
import {
  authenticator,
  getAllUsers,
  getCurrentUser,
  updateUserImage,
  updateUserName,
} from '~/services/auth.server';
import Player from '~/components/Player';
import Tiles from '~/components/Tiles';
import Search from '~/components/Search';
import Following from '~/components/Following';
import PlayerPaused from '~/components/PlayerPaused';
import Tooltip from '~/components/Tooltip';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';
// import MiniTile from '~/components/MiniTile';
import TopTracks from '~/components/tiles/TopTracks';
import RecentTracks from '~/components/tiles/RecentTracks';
import LikedTracks from '~/components/tiles/LikedTracks';
import Playlists from '~/components/tiles/Playlists';
import ActivityFeed from '~/components/ActivityTile';
import { lessThanADay, lessThanAWeek, msToHours } from '~/lib/utils';
import { askDaVinci } from '~/services/ai.server';
import { Smileys } from 'iconsax-react';
import MoodButton from '~/components/MoodButton';
// import OldLikedSongs from '~/components/tiles/OldLikedTracks';
// import LikedTracksVirtual from '~/components/tiles/LikedTracksVirtual';

const Profile = () => {
  const {
    user,
    playback,
    recent,
    currentUser,
    party,
    liked,
    top,
    activity,
    following,
    // queue,
    playlists,
  } = useTypedLoaderData<typeof loader>();
  const submit = useSubmit();

  return (
    <Stack spacing={5} pb={5} pt={5} h="max-content">
      <HStack>
        <Tooltip label="<3" placement="top">
          <Image borderRadius="100%" boxSize={[150, 150, 200]} src={user.image} />
        </Tooltip>
        <Stack flex={1} maxW="calc(100% - 100px)">
          <HStack spacing={5} alignItems="end">
            <Heading
              size={user.name.length > 10 ? 'lg' : user.name.length > 16 ? 'md' : 'xl'}
              fontWeight="bold"
              textAlign="left"
            >
              {user.name}
            </Heading>
            <Text pb="5px">{user.ai?.mood}</Text>
            <Flex pb="5px">
              {currentUser && <MoodButton />}
              {currentUser && following !== null && <Following following={following} />}
            </Flex>
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
                focusBorderColor="spotify.green"
              />
            </Form>
          ) : (
            <Text
              fontSize="14px"
              noOfLines={3}
              whiteSpace="normal"
              zIndex={-2}
              wordBreak="break-word"
            >
              {user.bio}
            </Text>
          )}
        </Stack>
      </HStack>
      {playback && playback.item?.type === 'track' ? (
        <Player id={user.userId} party={party} playback={playback} item={playback.item} />
      ) : recent ? (
        <PlayerPaused item={recent[0].track} username={user.name} />
      ) : null}
      {currentUser?.id !== user.id && <Search />}
      <Stack spacing={5}>
        {activity.length !== 0 && (
          <Tiles spacing="15px">
            {activity.map((track) => {
              return <ActivityFeed key={track.id} track={track} />;
            })}
          </Tiles>
        )}
      </Stack>
      <RecentTracks recent={recent} />
      {/* <LikedTracksVirtual liked={liked}  /> */}
      <LikedTracks liked={liked} />
      {/* <OldLikedSongs liked={liked}  /> */}
      <TopTracks top={top} />
      <Playlists playlists={playlists} />
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
  const session = await authenticator.isAuthenticated(request);

  const url = new URL(request.url);
  const topFilter = (url.searchParams.get('top-filter') || 'medium_term') as
    | 'medium_term'
    | 'long_term'
    | 'short_term';

  const user = await prisma.profile.findUnique({
    where: { userId: id },
    include: { settings: true, ai: true },
  });

  if (!user || (!session && user.settings?.isPrivate))
    throw new Response('Not found', { status: 404 });

  const { spotify } = await spotifyApi(id).catch(async (e) => {
    if (e instanceof Error && e.message.includes('revoked')) {
      throw new Response('User Access Revoked', { status: 401 });
    }
    throw new Response('Failed to load Spotify', { status: 500 });
  });
  if (!spotify) {
    throw new Response('Failed to load Spotify [2]', { status: 500 });
  }

  const spotifyProfile = await spotify.getMe().catch(() => null);
  const pfp = spotifyProfile?.body.images;
  if (pfp) {
    await updateUserImage(id, pfp[0].url);
  }

  const spotifyProfileName = await spotify.getMe().catch(() => null);
  const name = spotifyProfileName?.body.display_name;
  if (name) {
    await updateUserName(id, name);
  }

  const [
    activity,
    party,
    recent,
    liked,
    top,
    playlists,
    { currently_playing: playback, queue },
    users,
  ] = await Promise.all([
    prisma.queue.findMany({
      where: { OR: [{ userId: id }, { ownerId: id }] },
      include: { user: true, owner: { select: { user: true, accessToken: false } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.party.findMany({ where: { ownerId: id } }),
    spotify
      .getMyRecentlyPlayedTracks({ limit: 50 })
      .then((data) => data.body.items)
      .catch(() => []),
    spotify
      .getMySavedTracks({ limit: 50 })
      .then((data) => data.body.items)
      .catch(() => []),
    spotify
      .getMyTopTracks({ time_range: topFilter, limit: 50 })
      .then((data) => data.body.items)
      .catch(() => []),
    spotify
      .getUserPlaylists(user.userId, { limit: 50 })
      .then((res) => res.body.items.filter((data) => data.public && data.owner.id === id))
      .catch(() => []),
    getUserQueue(id).catch(() => {
      return {
        currently_playing: null,
        queue: [],
      };
    }),
    getAllUsers().then((user) => user.filter((user) => user.userId !== id)),
  ]);

  // const filteredRecent = recent.filter(({ played_at }) => {
  //   const playedAt = new Date(played_at);
  //   return lessThanADay(playedAt);
  //   return lessThanAWeek(playedAt);
  // });

  // const listenedTime = msToHours(
  //   filteredRecent.map((track) => track.track.duration_ms).reduce((a, b) => a + b, 0),
  // );

  const currentUser = await getCurrentUser(request);
  if (currentUser) {
    const { spotify } = await spotifyApi(currentUser.userId);
    invariant(spotify, 'Spotify API Error');
    const {
      body: [following],
    } = await spotify.isFollowingUsers([id]);

    return typedjson({
      user,
      activity,
      party,
      playback,
      recent,
      liked,
      top,
      playlists,
      currentUser,
      following,
      queue,
      users,
    });
  }

  return typedjson({
    user,
    activity,
    party,
    playback,
    recent,
    liked,
    top,
    playlists,
    currentUser,
    following: null,
    queue,
    users,
  });
};

export const action = async ({ request, params }: ActionArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const data = await request.formData();
  const bio = data.get('bio');
  const follow = data.get('follow');
  const mood = data.get('mood');
  const currentUser = await getCurrentUser(request);
  invariant(currentUser, 'Missing current user');
  const { spotify } = await spotifyApi(currentUser.userId);
  invariant(spotify, 'Spotify API Error');

  if (follow === 'true') {
    await spotify.followUsers([id]);
  } else if (follow === 'false') {
    await spotify.unfollowUsers([id]);
  }

  if (typeof bio === 'string') {
    const user = await prisma.profile.update({ where: { userId: id }, data: { bio } });
    return user;
  }

  if (typeof mood === 'string') {
    const { spotify } = await spotifyApi(id);
    invariant(spotify, 'Spotify API Error');
    const recent = await spotify.getMyRecentlyPlayedTracks({ limit: 50 });
    const tracks = recent.body.items.map((item) => ({
      song_name: item.track.name,
      artist_name: item.track.artists[0].name,
      album_name: item.track.album.name,
    }));

    const prompt = `Based on these songs given below, describe my current mood in one word. 
    ${JSON.stringify(tracks)}`;
    const response = (await askDaVinci(prompt)).split('.')[0];
    await prisma.aI.upsert({
      where: { userId: id },
      create: { mood: response, userId: id },
      update: { mood: response },
    });
  }

  return null;
};

export const ErrorBoundary = (error: { error: Error }) => {
  console.log('$id -> ErrorBoundary', error);

  return (
    <>
      <Heading fontSize={['xl', 'xxl']}>500</Heading>
      <Text fontSize="md">oops something broke :3;</Text>
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

export default Profile;
