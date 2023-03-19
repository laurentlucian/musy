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
import { getMood } from '~/services/ai.server';
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
  const { blockRecord, user } = useTypedLoaderData<typeof loader>();
  const currentUser = useSessionUser();
  const isPrivate = user?.settings?.isPrivate;
  const isOwnProfile = currentUser?.userId === user.userId;
  const isDev = currentUser?.settings?.dev === true;
  const bg = useColorModeValue(user.theme?.backgroundLight, user.theme?.backgroundDark);
  const bgGradient = useColorModeValue(user.theme?.bgGradientLight, user.theme?.bgGradientDark);
  const gradient = user.theme?.gradient;

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
        <ProfileHeader isPrivate={isPrivate} />
        {isPrivate && !isOwnProfile && !isDev ? (
          <PrivateProfile name={user.name} />
        ) : !blockRecord ? (
          <Outlet />
        ) : (
          <>This user is blocked</>
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

  return typedjson({
    blockRecord,
    currentUser,
    favRecord,
    following: null,
    friendRecord,
    listened,
    muteRecord,
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
  const favUser = data.get('favUser');
  const favId = data.get('favId');
  const blockUser = data.get('blockUser');
  const blockId = data.get('blockId');
  const muteUser = data.get('muteUser');
  const muteId = data.get('muteId');
  const easterEgg = data.get('component');
  const currentUser = await getCurrentUser(request);
  const friendStatus = data.get('friendStatus');
  invariant(currentUser, 'Missing current user');
  // const profile = await prisma.profile.findUnique({ where: { userId: currentUser.userId } });
  // invariant(profile, 'Profile not found');
  const { spotify } = await spotifyApi(currentUser.userId);
  invariant(spotify, 'Spotify API Error');

  if (friendStatus === 'requested') {
    const newFriendRecord = await prisma.friends.create({
      data: {
        friendId: id,
        status: 'pending',
        userId: currentUser.userId,
      },
    });

    const friendRecord = await prisma.friends.findFirst({
      where: {
        friendId: currentUser.userId,
        userId: id,
      },
    });

    if (friendRecord && friendRecord.status === 'pending') {
      await prisma.friends.update({
        data: {
          status: 'accepted',
        },
        where: {
          id: friendRecord.id,
        },
      });

      await prisma.friends.update({
        data: {
          status: 'accepted',
        },
        where: {
          id: newFriendRecord.id,
        },
      });
    }
  } else if (friendStatus === 'block') {
    await prisma.friends.create({
      data: {
        friendId: id,
        status: 'blocked',
        userId: currentUser.userId,
      },
    });
  } else if (friendStatus === 'unblock') {
    const blockRecord = await prisma.friends.findFirst({
      where: {
        friendId: currentUser.userId,
        userId: id,
      },
    });
    await prisma.friends.update({
      data: {
        status: 'unblocked',
      },
      where: {
        id: blockRecord?.id,
      },
    });
  }

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
    const response = await getMood(recent.body);
    await prisma.aI.upsert({
      create: { mood: response, userId: id },
      update: { mood: response },
      where: { userId: id },
    });
  }

  if (favUser === 'true') {
    await prisma.favorite.create({
      data: {
        favorite: {
          connect: { userId: id },
        },
        favoritedBy: {
          connect: { userId: currentUser.userId },
        },
      },
    });
  } else if (favUser === 'false') {
    await prisma.favorite.delete({
      where: {
        id: Number(favId),
      },
    });
  }

  if (blockUser === 'true') {
    await prisma.block.create({
      data: {
        block: {
          connect: { userId: id },
        },
        blockedBy: {
          connect: { userId: currentUser.userId },
        },
      },
    });
  } else if (blockUser === 'false') {
    await prisma.block.delete({
      where: {
        id: Number(blockId),
      },
    });
  }

  if (muteUser === 'true') {
    await prisma.mute.create({
      data: {
        mute: {
          connect: { userId: id },
        },
        mutedBy: {
          connect: { userId: currentUser.userId },
        },
      },
    });
  } else if (muteUser === 'false') {
    await prisma.mute.delete({
      where: {
        id: Number(muteId),
      },
    });
  }

  if (typeof easterEgg === 'string') {
    if (easterEgg === '69') {
      await prisma.settings.upsert({
        create: { easterEgg: true, userId: id },
        update: { easterEgg: true },
        where: { userId: id },
      });
    } else {
      await prisma.settings.upsert({
        create: { easterEgg: false, userId: id },
        update: { easterEgg: false },
        where: { userId: id },
      });
    }
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
