import { Heading, Stack, Text } from '@chakra-ui/react';

import { useCatch } from '@remix-run/react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import type { LoaderArgs } from '@remix-run/node';
import MiniPlayer from '~/components/MiniPlayer';
import { authenticator, getAllUsers } from '~/services/auth.server';
import { getUserQueue } from '~/services/spotify.server';
import { notNull } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import Tiles from '~/components/Tiles';
import ActivityFeed from '~/components/ActivityFeed';
import type { LikedSongs, Profile, Queue } from '@prisma/client';

const Index = () => {
  const { users, playbacks, activity } = useTypedLoaderData<typeof loader>();

  return (
    <Stack pb="50px" pt={{ base: 4, md: 0 }} spacing={{ base: 4, md: 10 }}>
      <Stack>
        <Tiles autoScroll={false}>
          {activity.map((track) => {
            return <ActivityFeed key={track.id} track={track} />;
          })}
        </Tiles>
      </Stack>
      <Stack>
        {users.map((user) => {
          const playback = playbacks.find((data) => data.userId === user.userId);
          return <MiniPlayer key={user.userId} user={user} playback={playback} />;
        })}
      </Stack>
    </Stack>
  );
};

export type Activity = {
  createdAt: Date;
  id: number;
  trackId?: string;
  uri: string;
  name: string;
  image: string;
  albumUri: string | null;
  albumName: string | null;
  artist: string;
  artistUri: string | null;
  explicit: boolean;
  userId: string | null;
  user: Profile | null;
  owner?: { user: Profile; userId: string };
  action: string;
};

export const loader = async ({ request }: LoaderArgs) => {
  const users = await getAllUsers();
  const session = await authenticator.isAuthenticated(request);
  const user = session?.user ?? null;

  if (!users.length) return typedjson({ users, user, playbacks: [], activity: [] });

  const getPlaybackState = async (id: string) => {
    try {
      const data = await getUserQueue(id);
      if (!data.currently_playing) return null;
      return data;
    } catch {
      return null;
    }
  };

  const playbacks = (await Promise.all(users.map((user) => getPlaybackState(user.userId)))).filter(
    notNull,
  );

  const isPlayingIds = playbacks.map((data) => data.userId);
  // place playingNow users at top; o(n) but n is small
  users.sort((a, b) => isPlayingIds.indexOf(b.userId) - isPlayingIds.indexOf(a.userId));

  const liked = (
    await prisma.likedSongs.findMany({
      take: 20,
      orderBy: { likedAt: 'desc' },
      include: { user: true },
    })
  ).map((data) => ({ ...data, createdAt: data.likedAt }));

  const queued = await prisma.queue.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: { user: true, owner: { select: { user: true, accessToken: false } } },
  });

  const activity = [...liked, ...queued].sort((a, b) => {
    if (a.createdAt && b.createdAt) return b.createdAt.getTime() - a.createdAt.getTime();
    return 0;
  }) as Activity[];

  return typedjson(
    { users, user, playbacks, activity },
    {
      headers: { 'Cache-Control': 'public, maxage=5, s-maxage=0, stale-while-revalidate=10' },
    },
  );
};

export default Index;

export const ErrorBoundary = ({ error }: { error: Error }) => {
  console.log('index -> ErrorBoundary', error);
  return (
    <>
      <Heading fontSize={['sm', 'md']}>Oops, unhandled error</Heading>
      <Text fontSize="sm">Trace(for debug): {error.message}</Text>
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
    case 429:
      message = <Text>Oops, API suspended (too many requests)</Text>;
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <>
      <Heading fontSize={['sm', 'md']}>
        {caught.status}: {caught.statusText}
      </Heading>
      <Text fontSize="sm">{message}</Text>
    </>
  );
};
