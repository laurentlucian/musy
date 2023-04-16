import type { MetaFunction, LoaderArgs, ActionArgs } from '@remix-run/node';
import { Outlet, useParams } from '@remix-run/react';

import { Stack, Box, useColorModeValue } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import BlockedProfile from '~/components/profile/BlockedProfile';
import PrivateProfile from '~/components/profile/PrivateProfile';
import ProfileHeader from '~/components/profile/ProfileHeader';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';
import { lessThanADay, lessThanAWeek } from '~/lib/utils';
import { msToString } from '~/lib/utils';
import { getMood } from '~/services/ai.server';
import { authenticator, getAllUsers, getCurrentUser } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

const Profile = () => {
  const isSmallScreen = useIsMobile();
  const { user } = useTypedLoaderData<typeof loader>();
  const currentUser = useSessionUser();
  const { id } = useParams();
  const isPrivate = user?.settings?.isPrivate;
  const isOwnProfile = currentUser?.userId === user.userId;
  const isDev = currentUser?.settings?.dev === true;
  const bg = useColorModeValue(user.theme?.backgroundLight, user.theme?.backgroundDark);
  const bgGradient = useColorModeValue(user.theme?.bgGradientLight, user.theme?.bgGradientDark);
  const gradient = user.theme?.gradient;
  const blockRecord = currentUser?.block.find((blocked) => blocked.blockId === id);

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
          <BlockedProfile name={user.name} />
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

  const [session, users, user, recentDb] = await Promise.all([
    authenticator.isAuthenticated(request),
    getAllUsers().then((user) => user.filter((user) => user.userId !== id)),
    prisma.profile.findUnique({
      include: { ai: true, settings: { include: { profileSong: true } }, theme: true },
      where: { userId: id },
    }),
    prisma.recentSongs.findMany({
      orderBy: { playedAt: 'desc' },
      select: { playedAt: true, track: { select: { duration: true } } },
      where: { userId: id },
    }),
  ]);

  if (!user || (!session && user.settings?.isPrivate))
    throw new Response('Not found', { status: 404 });

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

  return typedjson({
    following: null,
    listened,
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
  const isFavorited = data.get('isFavorited');
  const blockUser = data.get('blockUser');
  const blockId = data.get('blockId');
  const muteUser = data.get('muteUser');
  const muteId = data.get('muteId');
  const easterEgg = data.get('component');
  const currentUser = await getCurrentUser(request);
  const friendStatus = data.get('friendStatus');
  invariant(currentUser, 'Missing current user');
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

  if (isFavorited === 'true') {
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
  } else {
    const fav = await prisma.favorite.findFirst({
      select: { id: true },
      where: { AND: [{ favoriteId: id, favoritedById: currentUser.userId }] },
    });
    if (fav) {
      await prisma.favorite.delete({
        where: { id: fav.id },
      });
    }
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

export { CatchBoundary } from '~/components/error/CatchBoundary';

export { ErrorBoundary } from '~/components/error/ErrorBoundary';

export default Profile;
