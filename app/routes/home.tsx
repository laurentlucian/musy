import type { LoaderArgs } from '@remix-run/server-runtime';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import ActivityTile from '~/components/activity/ActivityTile';
import TilesPlayback from '~/components/tiles/TilesPlayback';
import useInfiniteFeed from '~/hooks/useInfiniteFeed';
import useRevalidateOnFocus from '~/hooks/useRevalidateOnFocus';
import { getFeed } from '~/services/prisma/tracks.server';
import { getCurrentUserId } from '~/services/prisma/users.server';

const Home = () => {
  useRevalidateOnFocus();
  const { feed } = useTypedLoaderData<typeof loader>();
  const { feed: more, waver } = useInfiniteFeed();

  return (
    <Stack spacing={[2, 10]} px={['5px', 0]}>
      <TilesPlayback />
      {feed.map((activity, index) => (
        <ActivityTile key={`activity.${activity.id}${index}`} activity={activity} />
      ))}
      {more.map((activity, index) => (
        <ActivityTile key={`activity.${activity.id}${index}`} activity={activity} />
      ))}
      {waver}
    </Stack>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const currentUserId = await getCurrentUserId(request);
  const feed = await getFeed(currentUserId);

  return typedjson({
    feed,
  });
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default Home;
