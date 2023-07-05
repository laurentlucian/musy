import type { LoaderArgs } from '@remix-run/server-runtime';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import ActivityTile from '~/components/activity/ActivityTile';
import TilesPlayback from '~/components/tiles/TilesPlayback';
import useRevalidateOnFocus from '~/hooks/useRevalidateOnFocus';
import { getFeed } from '~/services/prisma/tracks.server';
import { getCurrentUserId } from '~/services/prisma/users.server';

const Home = () => {
  const { feed } = useTypedLoaderData<typeof loader>();
  useRevalidateOnFocus();

  return (
    <Stack spacing={[2, 10]} px={['5px', 0]}>
      <TilesPlayback />
      {feed.map((activity, index) => (
        <ActivityTile key={index} activity={activity} />
      ))}
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
