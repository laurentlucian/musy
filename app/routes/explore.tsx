import type { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { Suspense } from 'react';

import { TypedAwait, typeddefer, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import ProfileButton from '~/components/profile/ProfileButton';
import TrackTiles from '~/components/tiles/TilesTrack';
import useFollowing from '~/hooks/useFollowing';
import { useRestOfUsers } from '~/hooks/useUsers';
import Waver from '~/lib/icons/Waver';
import { getCacheControl } from '~/lib/utils';
import { getSearchResults } from '~/services/prisma/spotify.server';
import { getTopLeaderboard } from '~/services/prisma/tracks.server';
import { getCurrentUser } from '~/services/prisma/users.server';

const Explore = () => {
  const { results, spotify, top } = useTypedLoaderData<typeof loader>();
  const following = useFollowing();
  const restOfUsers = useRestOfUsers();

  if (results.tracks.length || results.users.length || spotify) {
    return (
      <div className='stack-2 px-1'>
        <TrackTiles tracks={results.tracks} title='SONGS' />
        {spotify && (
          <Suspense fallback={<Waver />}>
            <TypedAwait resolve={spotify}>
              {(spotify) => {
                console.log('spotify', spotify);
                return <TrackTiles tracks={spotify} title='SONGS FROM SPOTIFY' />;
              }}
            </TypedAwait>
          </Suspense>
        )}
        {!!results.users.length && <p className='pt-2 text-[11px] font-bold'>USERS</p>}
        {results.users.map((user) => (
          <ProfileButton key={user.userId} user={user} />
        ))}
      </div>
    );
  }

  return (
    <div className='stack-3 px-1'>
      <TrackTiles tracks={top} title='WEEKLY MOST LISTENED' />
      <div className='stack-1 w-full max-w-[640px] self-center px-1 md:px-0'>
        {following.length && <p className='pt-2 text-[11px] font-bold'>FOLLOWING</p>}
        {following.map((user) => (
          <ProfileButton key={user.userId} user={user} />
        ))}
        {following.length && <p className='pt-2 text-[11px] font-bold'>EVERYONE</p>}
        {restOfUsers.map((user) => (
          <ProfileButton key={user.userId} user={user} />
        ))}
      </div>
    </div>
  );
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const currentUser = await getCurrentUser(request);
  invariant(currentUser, 'No user found');
  const userId = currentUser.userId;
  const [{ spotify, ...results }, top] = await Promise.all([
    getSearchResults({ param: 'keyword', url: new URL(request.url), userId }),
    getTopLeaderboard(),
  ]);

  return typeddefer(
    { results, spotify, top },
    {
      headers: { ...getCacheControl() },
    },
  );
};
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default Explore;
