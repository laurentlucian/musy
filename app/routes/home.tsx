import type { LoaderArgs } from '@remix-run/server-runtime';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import ActivityTile from '~/components/activity/ActivityTile';
import type { ProfileWithPlayback } from '~/components/tiles/TilesPlayback';
import TilesPlayback from '~/components/tiles/TilesPlayback';
import useFollowing from '~/hooks/useFollowing';
import type { TrackWithInfo } from '~/lib/types/types';
import { getCacheControl } from '~/lib/utils';
import { getActivity } from '~/services/prisma/tracks.server';
import { getCurrentUserId } from '~/services/prisma/users.server';

const Home = () => {
  const following = useFollowing();
  const { activities } = useTypedLoaderData<typeof loader>();

  const activityTracks = [] as TrackWithInfo[];
  for (const activity of activities) {
    activityTracks.push(activity.track);
  }

  const playbacks = following.filter((user) => user.playback) as ProfileWithPlayback[];

  return (
    <Stack spacing={[2, 10]} px={['5px', 0]}>
      <TilesPlayback users={playbacks} title="LISTENING NOW" />
      {activities.map((activity, index) => {
        return (
          <ActivityTile
            key={activity.id}
            layoutKey={'mActivity' + index}
            activity={activity}
            tracks={activityTracks}
            index={index}
          />
        );
      })}
    </Stack>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const currentUserId = await getCurrentUserId(request);
  const activities = await getActivity(currentUserId);

  return typedjson(
    {
      activities,
    },
    {
      headers: { ...getCacheControl() },
    },
  );
};

export default Home;

export { CatchBoundary } from '~/components/error/CatchBoundary';
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
