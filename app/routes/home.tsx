import { Stack, Text, useColorModeValue } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import ActivityTile from '~/components/home/activity/ActivityTile';
import MiniPlayer from '~/components/profile/player/MiniPlayer';
import Tiles from '~/components/profile/tiles/Tiles';
import useFriends from '~/hooks/useFriends';
import useSessionUser from '~/hooks/useSessionUser';
import { useRestOfUsers } from '~/hooks/useUsers';
import type { Activity, Track } from '~/lib/types/types';
import { prisma } from '~/services/db.server';

const Index = () => {
  const currentUser = useSessionUser();
  const friends = useFriends();
  const restOfUsers = useRestOfUsers();
  const { activity } = useTypedLoaderData<typeof loader>();
  const bg = useColorModeValue('#EEE6E2', '#050404');

  if (!activity) return null;
  let activities: Track[] = [];

  for (let i = 0; i < activity.length; i++) {
    activities.push({
      albumName: activity[i].track.albumName,
      albumUri: activity[i].track.albumUri,
      artist: activity[i].track.artist,
      artistUri: activity[i].track.artistUri,
      duration: 0,
      explicit: activity[i].track.explicit,
      id: activity[i].trackId,
      image: activity[i].track.image,
      link: activity[i].track.link,
      name: activity[i].track.name,
      preview_url: activity[i].track.preview_url ?? '',
      uri: activity[i].track.uri,
    });
  }

  let friendsPlaybacks: Track[] = [];
  for (let i = 0; i < friends.length; i++) {
    if (friends[i].playback === null || friends[i].playback?.track === undefined) {
      continue;
    }
    const track = {
      albumName: friends[i].playback!.track.albumName,
      albumUri: friends[i].playback!.track.albumUri,
      artist: friends[i].playback!.track.artist,
      artistUri: friends[i].playback!.track.artistUri,
      duration: 0,
      explicit: friends[i].playback!.track.explicit,
      id: friends[i].playback!.trackId,
      image: friends[i].playback!.track.image,
      link: friends[i].playback!.track.link,

      name: friends[i].playback!.track.name,
      preview_url: friends[i].playback!.track.preview_url ?? '',
      uri: friends[i].playback!.track.uri,
    };
    friendsPlaybacks.push(track);
  }

  let everyonePlaybacks: Track[] = [];
  for (let i = 0; i < restOfUsers.length; i++) {
    if (restOfUsers[i].playback === null || restOfUsers[i].playback?.track === undefined) {
      continue;
    }
    const track = {
      albumName: restOfUsers[i].playback!.track.albumName,
      albumUri: restOfUsers[i].playback!.track.albumUri,
      artist: restOfUsers[i].playback!.track.artist,
      artistUri: restOfUsers[i].playback!.track.artistUri,
      duration: 0,
      explicit: restOfUsers[i].playback!.track.explicit,
      id: restOfUsers[i].playback!.trackId,
      image: restOfUsers[i].playback!.track.image,
      link: restOfUsers[i].playback!.track.link,

      name: restOfUsers[i].playback!.track.name,
      preview_url: restOfUsers[i].playback!.track.preview_url ?? '',
      uri: restOfUsers[i].playback!.track.uri,
    };
    everyonePlaybacks.push(track);
  }

  return (
    <Stack pb="50px" pt={{ base: '15px', xl: 0 }} bg={bg} h="100%">
      <Stack px={['5px', 0]}>
        <Tiles spacing="15px" autoScroll={currentUser?.settings?.autoscroll ?? false}>
          {activity.map((item, index) => {
            return (
              <ActivityTile
                key={item.id}
                layoutKey={'mActivity' + index}
                activity={item}
                tracks={activities}
                index={index}
              />
            );
          })}
        </Tiles>
        <Text pt="10px" fontSize="12px" fontWeight="bold" color="#1f1f1f">
          FRIENDS
        </Text>
        {friends.map((user, index) => (
          <MiniPlayer
            key={user.userId}
            layoutKey={'MiniPlayerF' + index}
            user={user}
            currentUserId={currentUser?.userId}
            tracks={friendsPlaybacks}
            index={index}
          />
        ))}
        <Text pt="10px" fontSize="12px" fontWeight="bold" color="#1f1f1f">
          EVERYONE
        </Text>
        {restOfUsers.map((user, index) => (
          <MiniPlayer
            key={user.userId}
            layoutKey={'MiniPlayerF' + index}
            user={user}
            currentUserId={currentUser?.userId}
            tracks={everyonePlaybacks}
            index={index}
          />
        ))}
      </Stack>
    </Stack>
  );
};

const getActivity = async (): Promise<Activity[] | null> => {
  const [like, queue] = await Promise.all([
    prisma.likedSongs.findMany({
      include: {
        track: {
          include: {
            liked: { orderBy: { createdAt: 'asc' }, select: { user: true } },
            recent: { select: { user: true } },
          },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.queue.findMany({
      include: {
        owner: { select: { accessToken: false, user: true } },
        track: {
          include: { liked: { select: { user: true } }, recent: { select: { user: true } } },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);
  if (like || queue) {
    return [...like, ...queue]
      .sort((a, b) => {
        if (a.createdAt && b.createdAt) return b.createdAt.getTime() - a.createdAt.getTime();
        return 0;
      })
      .slice(0, 20) as Activity[];
  }
  return null;
};

export const loader = async () => {
  const activity = await getActivity();

  return typedjson({
    activity,
  });
};

export default Index;

export { CatchBoundary } from '~/components/error/CatchBoundary';
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
