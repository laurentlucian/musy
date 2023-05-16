import { Stack, useColorModeValue } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import ActivityTile from '~/components/home/activity/ActivityTile';
import MobileActivityTile from '~/components/home/activity/MobileActivityTile';
import MiniPlayer from '~/components/profile/player/MiniPlayer';
import Tiles from '~/components/profile/tiles/Tiles';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';
import useUsers from '~/hooks/useUsers';
import type { Activity, Track } from '~/lib/types/types';
import { prisma } from '~/services/db.server';

const Index = () => {
  const currentUser = useSessionUser();
  const isSmallScreen = useIsMobile();
  const users = useUsers();
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

  let playbacks: Track[] = [];

  for (let i = 0; i < users.length; i++) {
    if (users[i].playback === null || users[i].playback?.track === undefined) {
      continue;
    }
    const track = {
      albumName: users[i].playback!.track.albumName,
      albumUri: users[i].playback!.track.albumUri,
      artist: users[i].playback!.track.artist,
      artistUri: users[i].playback!.track.artistUri,
      duration: 0,
      explicit: users[i].playback!.track.explicit,
      id: users[i].playback!.trackId,
      image: users[i].playback!.track.image,
      link: users[i].playback!.track.link,

      name: users[i].playback!.track.name,
      preview_url: users[i].playback!.track.preview_url ?? '',
      uri: users[i].playback!.track.uri,
    };
    playbacks.push(track);
  }

  return (
    <Stack pb="50px" pt={{ base: '60px', xl: 0 }} bg={bg} h="100%">
      <Stack px={['5px', 0]}>
        {isSmallScreen ? (
          <Stack bg={bg} mb="100px">
            {activity.map((item, index) => {
              return (
                <MobileActivityTile
                  key={item.id}
                  layoutKey={'mActivity' + index}
                  activity={item}
                  tracks={activities}
                  index={index}
                />
              );
            })}
          </Stack>
        ) : (
          <>
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
            {users.map((user, index) => (
              <MiniPlayer
                key={user.userId}
                layoutKey={'MiniPlayerF' + index}
                user={user}
                currentUserId={currentUser?.userId}
                tracks={playbacks}
                index={index}
              />
            ))}
          </>
        )}
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
