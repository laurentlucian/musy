import type { MetaFunction, ActionArgs, LoaderArgs } from '@remix-run/node';
import { Link, Outlet, useCatch } from '@remix-run/react';
// import { useMemo } from 'react';

import { Heading, Stack, Button, Box, useColorModeValue } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import PrivateProfile from '~/components/profile/PrivateProfile';
import ProfileHeader from '~/components/profile/ProfileHeader';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';
import { lessThanADay, lessThanAWeek } from '~/lib/utils';
import { msToString } from '~/lib/utils';
import { askDaVinci } from '~/services/ai.server';
import {
  authenticator,
  getAllUsers,
  getCurrentUser,
  // updateUserImage,
  // updateUserName,
} from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

const Profile = () => {
  const isSmallScreen = useIsMobile();
  const { user } = useTypedLoaderData<typeof loader>();
  const currentUser = useSessionUser();
  const isPrivate = user?.settings?.isPrivate;
  const isOwnProfile = currentUser?.userId === user.userId;
  const isDev = currentUser?.settings?.dev === true;
  const bgGradient = useColorModeValue(user.theme?.bgGradientLight, user.theme?.bgGradientDark);

  return (
    <>
      <Box
        pos="absolute"
        top={0}
        left={0}
        w="100vw"
        h="100%"
        bgGradient={bgGradient}
        zIndex={0}
        bgAttachment="fixed"
      />
      <Stack
        spacing={5}
        pb={['110px', 5]}
        pt={['44px', 5]}
        h="max-content"
        px={isSmallScreen ? '5px' : 0}
        zIndex={1}
      >
        <ProfileHeader isPrivate={isPrivate} />
        {isPrivate && !isOwnProfile && !isDev ? <PrivateProfile name={user.name} /> : <Outlet />}
      </Stack>
    </>
  );
};

export const meta: MetaFunction = (props) => {
  return {
    title: `musy - ${props.data?.user?.name.split(' ')[0] ?? ''}`,
  };
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');
  const session = await authenticator.isAuthenticated(request);

  const user = await prisma.profile.findUnique({
    include: { ai: true, settings: true, theme: true },
    where: { userId: id },
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

  async function getProfileSong(id: string) {
    const settings = await prisma.settings.findUnique({
      include: { profileSong: true },
      where: { userId: id },
    });
    if (settings) {
      return settings.profileSong;
    } else {
      return null;
    }
  }

  const [users, profileSong] = await Promise.all([
    getAllUsers().then((user) => user.filter((user) => user.userId !== id)),
    getProfileSong(id),
  ]);

  const recentDb = await prisma.recentSongs.findMany({
    orderBy: { playedAt: 'desc' },
    select: { playedAt: true, track: { select: { duration: true } } },
    where: { userId: id },
  });

  const { searchParams } = new URL(request.url);
  const listenedTimeframe = searchParams.get('listened');
  const filteredRecent = recentDb.filter(({ playedAt }) => {
    const d = new Date(playedAt);
    if (listenedTimeframe === 'week') {
      return lessThanAWeek(d);
    }

    return lessThanADay(d);
  });

  const listened = msToString(
    filteredRecent.map(({ track }) => track.duration).reduce((a, b) => a + b, 0),
  );

  const currentUser = await getCurrentUser(request);
  // implement following state in prisma and stop fetching from spotify on every request
  // if (currentUser) {
  //   const { spotify } = await spotifyApi(currentUser.userId);
  //   invariant(spotify, 'Spotify API Error');
  //   const {
  //     body: [following],
  //   } = await spotify.isFollowingUsers([id]).catch((e) => ({ body: [false] }));

  //   // return defer({
  //   //   user,
  //   //   activity,
  //   //   party,
  //   //   playback,
  //   //   currentUser,
  //   //   following,
  //   //   queue,
  //   //   recommended,
  //   //   users,
  //   //   listened,
  //   //   lazyMain,
  //   // });

  //   return typedjson({
  //     activity,
  //     currentUser,
  //     following,
  //     listened,
  //     party,
  //     profileSong,
  //     user,
  //     users,
  //   });
  // }

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
    currentUser,
    following: null,
    listened,
    profileSong,
    user,
    users,
  });
};

export const action = async ({ params, request }: ActionArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const data = await request.formData();
  const bio = data.get('bio');
  const follow = data.get('follow');
  const mood = data.get('mood');
  const easterEgg = data.get('component');
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
    await prisma.profile.update({ data: { bio }, where: { userId: id } });
  }

  if (typeof mood === 'string') {
    const { spotify } = await spotifyApi(id);
    invariant(spotify, 'Spotify API Error');
    const recent = await spotify.getMyRecentlyPlayedTracks({ limit: 50 });
    const tracks = recent.body.items.map((item) => ({
      album_name: item.track.album.name,
      artist_name: item.track.artists[0].name,
      song_name: item.track.name,
    }));

    const prompt = `Based on these songs given below, describe my current mood in one word. 
    ${JSON.stringify(tracks)}`;
    const response = (await askDaVinci(prompt)).split('.')[0];
    await prisma.aI.upsert({
      create: { mood: response, userId: id },
      update: { mood: response },
      where: { userId: id },
    });
  }

  // if (easterEgg === '69') {
  //   await prisma.settings.update({
  //     data: { easterEgg: true },
  //     where: { userId: id },
  //   });
  // } else {
  //   await prisma.settings.update({
  //     data: { easterEgg: false },
  //     where: { userId: id },
  //   });
  // }

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
