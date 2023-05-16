import type { MetaFunction, LoaderArgs, ActionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import BlockedProfile from '~/components/profile/profileHeader/BlockedProfile';
import PrivateProfile from '~/components/profile/profileHeader/PrivateProfile';
import ProfileHeader from '~/components/profile/profileHeader/ProfileHeader';
import useSessionUser from '~/hooks/useSessionUser';
import { msToString } from '~/lib/utils';
import { getMood } from '~/services/ai.server';
import { authenticator, getCurrentUser } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

const Profile = () => {
  const { user } = useTypedLoaderData<typeof loader>();
  const currentUser = useSessionUser();

  const isDev = currentUser?.settings?.dev === true;
  const isOwnProfile = currentUser?.userId === user.userId;
  const isPrivate = user.settings?.isPrivate && !isOwnProfile && !isDev;
  const youAreBlocked = currentUser?.block.find((blocked) => blocked.blockedId === user.userId);

  const Profile = isPrivate ? (
    <PrivateProfile name={user.name} />
  ) : youAreBlocked ? (
    <BlockedProfile name={user.name} />
  ) : (
    <Outlet />
  );

  return (
    <Stack
      spacing={5}
      pb={['110px', 5]}
      pt={['44px', 5]}
      h="max-content"
      px={['5px', 0]}
      zIndex={1}
    >
      <ProfileHeader />
      {Profile}
    </Stack>
  );
};

export const meta: MetaFunction = (props) => {
  return {
    title: `musy - ${props.data?.user?.name.split(' ')[0] ?? ''}`,
  };
};

const week = () => {
  const aWeekAgo = new Date();
  aWeekAgo.setDate(aWeekAgo.getDate() - 7);
  return aWeekAgo;
};

const day = () => {
  const aDayAgo = new Date();
  aDayAgo.setDate(aDayAgo.getDate() - 1);
  return aDayAgo;
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');
  const { searchParams } = new URL(request.url);
  const listenedTimeframe = searchParams.get('listened');

  const dateToCompare = listenedTimeframe === 'week' ? week() : day();

  const [session, user, recentDb] = await Promise.all([
    authenticator.isAuthenticated(request),
    prisma.profile.findUnique({
      include: { ai: true, settings: { include: { profileSong: true } }, theme: true },
      where: { userId: id },
    }),
    prisma.recentSongs.findMany({
      orderBy: { playedAt: 'desc' },
      select: { playedAt: true, track: { select: { duration: true } } },
      where: { playedAt: { gt: dateToCompare }, userId: id },
    }),
  ]);

  if (!user || (!session && user.settings?.isPrivate)) {
    throw new Response('Not found', { status: 404 });
  }

  const listened = msToString(
    recentDb.map(({ track }) => track.duration).reduce((a, b) => a + b, 0),
  );

  return typedjson({
    listened,
    user,
  });
};

export const action = async ({ params, request }: ActionArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');
  const currentUser = await getCurrentUser(request);
  invariant(currentUser, 'Missing current user');

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
  const friendStatus = data.get('friendStatus');
  const isFriend = data.get('isFriend');

  console.log('friendStatus', friendStatus);
  if (friendStatus === 'requested') {
    const isPending = await prisma.pendingFriend.findFirst({
      where: {
        pendingFriendId: currentUser.userId,
        userId: id,
      },
    });

    await prisma.pendingFriend.create({
      data: {
        pendingFriendId: id,
        userId: currentUser.userId,
      },
    });

    if (isPending) {
      await prisma.friend.create({
        data: { friendId: currentUser.userId, userId: id },
      });
      await prisma.friend.create({
        data: { friendId: id, userId: currentUser.userId },
      });
    }
  } else if (friendStatus === 'block') {
    await prisma.block.create({
      data: {
        blockedId: id,
        userId: currentUser.userId,
      },
    });
  } else if (friendStatus === 'unblock') {
    await prisma.block.delete({
      where: { userId_blockedId: { blockedId: id, userId: currentUser.userId } },
    });
  }
  if (follow === 'true') {
    const { spotify } = await spotifyApi(currentUser.userId);
    invariant(spotify, 'Spotify API Error');
    await spotify.followUsers([id]);
  } else if (follow === 'false') {
    const { spotify } = await spotifyApi(currentUser.userId);
    invariant(spotify, 'Spotify API Error');
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

  if (isFriend === 'true') {
    const friendRecord = await prisma.friend.findUnique({
      select: { id: true },
      where: { userId_friendId: { friendId: id, userId: currentUser.userId } },
    });
    const secondFriendRecord = await prisma.friend.findUnique({
      select: { id: true },
      where: { userId_friendId: { friendId: currentUser.userId, userId: id } },
    });
    if (friendRecord && secondFriendRecord) {
      console.log('deleted friend');
      await prisma.friend.delete({
        where: { id: friendRecord.id },
      });
      await prisma.friend.delete({
        where: { id: secondFriendRecord.id },
      });
    }
  }

  if (isFavorited === 'true') {
    await prisma.favorite.create({
      data: {
        favorite: {
          connect: { userId: currentUser.userId },
        },
        user: {
          connect: { userId: id },
        },
      },
    });
  } else if (isFavorited === 'false') {
    const fav = await prisma.favorite.findFirst({
      select: { id: true },
      where: { AND: [{ favoriteId: id, userId: currentUser.userId }] },
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
        blocked: {
          connect: { userId: id },
        },
        user: {
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
        muted: {
          connect: { userId: id },
        },
        user: {
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
