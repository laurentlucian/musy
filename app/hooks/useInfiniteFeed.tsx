import { useEffect, useMemo, useState } from 'react';

import { useTypedFetcher } from 'remix-typedjson';

import useInfiniteScroll from '~/hooks/useInfiniteScroll';
import type { Feed } from '~/lib/types/types';
import type { loader as feedLoader } from '~/routes/api+/activity+/feed';

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
    200,
  );

  useEffect(() => {
    if (!data.length) return;
    setFeed((prev) => [...prev, data]);
  }, [data]);

  const flatted = useMemo(() => feed.flat(), [feed]);

  return { feed: flatted, waver };
};

export default useInfiniteFeed;
