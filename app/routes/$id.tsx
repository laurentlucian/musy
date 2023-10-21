import type { LoaderFunctionArgs } from '@remix-run/node';
import type { MetaFunction } from '@remix-run/react';
import { Outlet } from '@remix-run/react';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import BlockedProfile from '~/components/profile/profileHeader/BlockedProfile';
import PrivateProfile from '~/components/profile/profileHeader/PrivateProfile';
import ProfileHeader from '~/components/profile/profileHeader/ProfileHeader';
import useCurrentUser from '~/hooks/useCurrentUser';
import useRevalidateOnFocus from '~/hooks/useRevalidateOnFocus';
import { msToString } from '~/lib/utils';
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { getTheme } from '~/services/prisma/theme.server';

const Profile = () => {
  const { user } = useTypedLoaderData<typeof loader>();
  const currentUser = useCurrentUser();
  useRevalidateOnFocus();

  const isDev = currentUser?.settings?.dev === true;
  const isOwnProfile = currentUser?.userId === user.userId;
  const isPrivate = user.settings?.isPrivate && !isOwnProfile && !isDev;
  const isBlocked = currentUser?.block.find((blocked) => blocked.blockedId === user.userId);

  const Profile = isPrivate ? (
    <PrivateProfile name={user.name} />
  ) : isBlocked ? (
    <BlockedProfile name={user.name} />
  ) : (
    <Outlet />
  );

  return (
    <Stack spacing={5} px={['5px', 0]} zIndex={1}>
      <ProfileHeader />
      {Profile}
    </Stack>
  );
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `musy - ${data?.user?.name.split(' ')[0] ?? ''}`,
    },
  ];
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

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');
  const { searchParams } = new URL(request.url);
  const listenedTimeframe = searchParams.get('listened');

  const dateToCompare = listenedTimeframe === 'week' ? week() : day();

  const [session, user, recentDb, theme] = await Promise.all([
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
    getTheme(params.id),
  ]);

  if (!user || (!session && user.settings?.isPrivate)) {
    throw new Response('Not found', { status: 404 });
  }

  const listened = msToString(
    recentDb.map(({ track }) => track.duration).reduce((a, b) => a + b, 0),
  );

  return typedjson({
    listened,
    theme,
    user,
  });
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default Profile;
