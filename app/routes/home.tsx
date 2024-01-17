import type { LoaderFunctionArgs } from '@remix-run/server-runtime';

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
    <article className='stack-2 px-1 md:space-y-10 md:px-0'>
      <TilesPlayback />
      {feed.map((activity, index) => (
        <ActivityTile key={`activity.${activity.id}${index}`} activity={activity} />
      ))}
      {more.map((activity, index) => (
        <ActivityTile key={`activity.${activity.id}${index}`} activity={activity} />
      ))}
      {waver}
    </article>
  );
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const currentUserId = await getCurrentUserId(request);
  const feed = await getFeed(currentUserId);

  return typedjson({
    feed,
  });
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default Home;
