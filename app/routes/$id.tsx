import type { MetaFunction, LoaderArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';

import { Stack, Box, useColorModeValue } from '@chakra-ui/react';

import type { Theme } from '@prisma/client';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import BlockedProfile from '~/components/profile/BlockedProfile';
import PrivateProfile from '~/components/profile/PrivateProfile';
import ProfileHeader from '~/components/profile/ProfileHeader';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';
import { lessThanADay, lessThanAWeek } from '~/lib/utils';
import { msToString } from '~/lib/utils';
import { authenticator, getAllUsers, getCurrentUser } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { redis } from '~/services/scheduler/redis.server';
import { spotifyApi } from '~/services/spotify.server';

const Profile = () => {
  const isSmallScreen = useIsMobile();
  const { blockRecord, theme, user } = useTypedLoaderData<typeof loader>();
  const currentUser = useSessionUser();
  const isPrivate = user?.settings?.isPrivate;
  const isOwnProfile = currentUser?.userId === user.userId;
  const isDev = currentUser?.settings?.dev === true;
  const bg = useColorModeValue(theme?.backgroundLight, theme?.backgroundDark);
  const bgGradient = useColorModeValue(theme?.bgGradientLight, theme?.bgGradientDark);
  const gradient = theme?.gradient;
  const amIBlocked = blockRecord?.blockId === currentUser?.userId;

  return (
    <>
      <Box
        pos="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        bg={bg}
        bgGradient={gradient ? bgGradient : undefined}
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
        <ProfileHeader amIBlocked={amIBlocked} isPrivate={isPrivate} />
        {isPrivate && !isOwnProfile && !isDev ? (
          <PrivateProfile name={user.name} />
        ) : !blockRecord ? (
          <Outlet />
        ) : (
          <BlockedProfile name={user.name} amIBlocked={amIBlocked} />
        )}
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
    include: { ai: true, settings: true, theme: false },
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

  let friendRecord = null;
  if (currentUser && currentUser.userId !== id) {
    friendRecord = await prisma.friends.findFirst({
      where: {
        friendId: id,
        userId: currentUser.userId,
      },
    });
  }

  let favRecord = null;
  if (currentUser && currentUser.userId !== id) {
    favRecord = await prisma.favorite.findFirst({
      where: {
        favoriteId: id,
        favoritedById: currentUser.userId,
      },
    });
  }

  let blockRecord = null;
  if (currentUser && currentUser.userId !== id) {
    blockRecord = await prisma.block.findFirst({
      where: {
        blockId: id,
        blockedById: currentUser.userId,
      },
    });
  }

  let muteRecord = null;
  if (currentUser && currentUser.userId !== id) {
    muteRecord = await prisma.mute.findFirst({
      where: {
        muteId: id,
        mutedById: currentUser.userId,
      },
    });
  }

  const currentThemeVersion = await prisma.profile
    .findUnique({
      select: { theme: { select: { version: true } } },
      where: { userId: id },
    })
    .then((result) => result?.theme?.version ?? null);

  const cacheThemeKey = 'theme';
  const themeVersionKey = 'version';
  const cachedTheme = await redis.get(cacheThemeKey);
  const cachedVersion = await redis.get(themeVersionKey);
  let theme: Theme | null;

  if (cachedTheme && Number(cachedVersion) === currentThemeVersion) {
    theme = JSON.parse(cachedTheme);
  } else {
    theme = await prisma.theme.findUnique({
      where: { userId: id },
    });

    await redis.set(themeVersionKey, JSON.stringify(currentThemeVersion));
    await redis.set(cacheThemeKey, JSON.stringify(theme));
  }

  return typedjson({
    blockRecord,
    currentUser,
    favRecord,
    following: null,
    friendRecord,
    listened,
    muteRecord,
    profileSong,
    theme,
    user,
    users,
  });
};

export { CatchBoundary } from '~/components/error/CatchBoundary';

export { ErrorBoundary } from '~/components/error/ErrorBoundary';

export default Profile;
