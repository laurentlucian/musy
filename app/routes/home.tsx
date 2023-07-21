import type { LoaderArgs } from '@remix-run/server-runtime';
import { useEffect, useMemo, useState } from 'react';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedFetcher, useTypedLoaderData } from 'remix-typedjson';

import ActivityTile from '~/components/activity/ActivityTile';
import TilesPlayback from '~/components/tiles/TilesPlayback';
import useInfiniteScroll from '~/hooks/useInfiniteScroll';
import useRevalidateOnFocus from '~/hooks/useRevalidateOnFocus';
import type { Feed } from '~/lib/types/types';
import type { loader as feedLoader } from '~/routes/api/activity/feed';
import { getFeed } from '~/services/prisma/tracks.server';
import { getCurrentUserId } from '~/services/prisma/users.server';

const useInfiniteFeed = () => {
  const [feed, setFeed] = useState<Feed[]>([]);
  const [page, setPage] = useState(0);
  const { data = [], load, state } = useTypedFetcher<typeof feedLoader>();
  const isFetching = state === 'loading';
  const { waver } = useInfiniteScroll(
    () => {
      if (isFetching) return;
      const next = page + 1;
      setPage(next);
      load(`/api/activity/feed?limit=10&offset=${next}`);
    },
    isFetching,
    1500,
  );

  useEffect(() => {
    if (!data) return;
    setFeed((prev) => [...prev, data]);
  }, [data]);

  const flatted = useMemo(() => feed.flat(), [feed]);

  return { feed: flatted, waver };
};

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
