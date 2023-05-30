import { Stack, useColorModeValue } from '@chakra-ui/react';
import { LoaderArgs } from '@remix-run/server-runtime';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import ActivityTile from '~/components/home/activity/ActivityTile';
import type { TrackWithInfo } from '~/lib/types/types';
import { getActivity } from '~/services/prisma/tracks.server';
import { getCurrentUserId } from '~/services/prisma/users.server';

const Home = () => {
  const { activities } = useTypedLoaderData<typeof loader>();
  const bg = useColorModeValue('#EEE6E2', '#050404');

  const activityTracks = [] as TrackWithInfo[];
  for (const activity of activities) {
    if (!activity.track) continue;
    activityTracks.push(activity.track);
  }

  return (
    <Stack spacing={[2, 10]} px={['5px', 0]} bg={bg}>
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

  return typedjson({
    activities,
  });
};

export default Home;

export { CatchBoundary } from '~/components/error/CatchBoundary';
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
