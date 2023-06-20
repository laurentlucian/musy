import type { LoaderArgs } from '@remix-run/server-runtime';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import ActivityTile from '~/components/activity/ActivityTile';
import TilesPlayback from '~/components/tiles/TilesPlayback';
import useRevalidateOnFocus from '~/hooks/useRevalidateOnFocus';
import { getCacheControl } from '~/lib/utils';
import { getActivity } from '~/services/prisma/tracks.server';
import { getCurrentUserId } from '~/services/prisma/users.server';

const Home = () => {
  const { activities } = useTypedLoaderData<typeof loader>();
  useRevalidateOnFocus();

  return (
    <Stack spacing={[2, 10]} px={['5px', 0]}>
      <TilesPlayback />
      {activities.map((activity, index) => (
        <ActivityTile key={index} activity={activity} />
      ))}
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

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default Home;
