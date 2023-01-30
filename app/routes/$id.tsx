import { Heading, Stack, Button } from '@chakra-ui/react';
import { Link, Outlet, useCatch } from '@remix-run/react';
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
import Player from '~/components/player/Player';
import Search from '~/components/Search';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';
import { askDaVinci } from '~/services/ai.server';
import { msToString } from '~/lib/utils';
import { lessThanADay } from '~/lib/utils';
import ProfileHeader from '~/components/profile/ProfileHeader';
// import PlayerPaused from '~/components/player/PlayerPaused';
import useIsMobile from '~/hooks/useIsMobile';

const Profile = () => {
  const { user, playback, currentUser, party /*, profileSong*/ } =
    useTypedLoaderData<typeof loader>();
  const isSmallScreen = useIsMobile();
  return (
    <Stack spacing={5} pb={5} pt={5} h="max-content" px={isSmallScreen ? '5px' : 0}>
      <ProfileHeader />
      {playback && playback.item?.type === 'track' && (
        <Player id={user.userId} party={party} playback={playback} item={playback.item} />
      )}
      {/* {playback && playback.item?.type === 'track' ? (
        <Player id={user.userId} party={party} playback={playback} item={playback.item} />
      ) : main[0] ? (
        <PlayerPaused item={main[0][0].track} username={user.name} profileSong={profileSong} />
      ) : null} */}
      {currentUser?.id !== user.id && <Search />}
      <Outlet />
    </Stack>
  );
};

export const meta: MetaFunction = (props) => {
  return {
    title: `musy - ${props.data?.user?.name.split(' ')[0] ?? ''}`,
  };
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');
  const session = await authenticator.isAuthenticated(request);

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

  const spotifyProfile = await spotify.getMe().catch((e) => {
    if (e.statusCode === 429) {
      const retryAfter = e.headers['retry-after'];
      const hours = Math.round(retryAfter / 3600);

      throw new Response(`Rate Limited for ${hours} hours 🥹`, { status: 429 });
    }

    return null;
  });
  const pfp = spotifyProfile?.body.images;
  if (pfp) {
    await updateUserImage(id, pfp[0].url);
  }

  const name = spotifyProfile?.body.display_name;
  if (name) {
    await updateUserName(id, name);
  }

  async function getProfileSong(id: string) {
    const settings = await prisma.settings.findUnique({
      where: { userId: id },
      include: { profileSong: true },
    });
    if (settings) {
      return settings.profileSong;
    } else {
      return null;
    }
  }

  const [activity, party, { currently_playing: playback, queue }, users, profileSong] =
    await Promise.all([
      prisma.queue.findMany({
        where: { OR: [{ userId: id }, { ownerId: id }] },
        include: { user: true, track: true, owner: { select: { user: true, accessToken: false } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.party.findMany({ where: { ownerId: id } }),
      getUserQueue(id).catch(() => {
        return {
          currently_playing: null,
          queue: [],
        };
      }),
      getAllUsers().then((user) => user.filter((user) => user.userId !== id)),
      getProfileSong(id),
    ]);

  const recentDb = await prisma.recentSongs.findMany({
    where: { userId: id },
    orderBy: { playedAt: 'desc' },
  });

  const filteredRecent = recentDb.filter(({ playedAt }) => {
    const d = new Date(playedAt);
    return lessThanADay(d);
    // return lessThanAWeek(d);
  });

  const listened = msToString(
    filteredRecent.map((track) => track.duration).reduce((a, b) => a + b, 0),
  );

  const currentUser = await getCurrentUser(request);
  if (currentUser) {
    const { spotify } = await spotifyApi(currentUser.userId);
    invariant(spotify, 'Spotify API Error');
    const {
      body: [following],
    } = await spotify.isFollowingUsers([id]).catch((e) => ({ body: [false] }));

    // return defer({
    //   user,
    //   activity,
    //   party,
    //   playback,
    //   currentUser,
    //   following,
    //   queue,
    //   recommended,
    //   users,
    //   listened,
    //   lazyMain,
    // });

    return typedjson({
      user,
      activity,
      party,
      playback,
      currentUser,
      following,
      queue,
      profileSong,
      users,
      listened,
    });
  }

  // return defer({
  //   user,
  //   activity,
  //   party,
  //   playback,
  //   currentUser,
  //   following: null,
  //   queue,
  //   recommended,
  //   users,
  //   listened,
  //   lazyMain,
  // });

  return typedjson({
    user,
    activity,
    party,
    playback,
    currentUser,
    following: null,
    queue,
    profileSong,
    users,
    listened,
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

export const CatchBoundary = () => {
  let caught = useCatch();
  switch (caught.status) {
    case 401:
      break;
    case 404:
      break;
    case 429:
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

export { ErrorBoundary } from '~/components/error/ErrorBoundary';

export default Profile;
