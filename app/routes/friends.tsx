import type { LoaderArgs } from '@remix-run/node';
import { useRevalidator } from '@remix-run/react';
import { useEffect } from 'react';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import PrismaMiniPlayer from '~/components/player/home/PrismaMiniPlayer';
import { useRevalidatorStore } from '~/hooks/useRevalidatorStore';
import useVisibilityChange from '~/hooks/useVisibilityChange';
import { authenticator, getAllUsers } from '~/services/auth.server';

const Friends = () => {
  const { currentUserId, users } = useTypedLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  const shouldRevalidate = useRevalidatorStore((state) => state.shouldRevalidate);
  const friends = users.filter((user) => user.userId !== currentUserId);
  const sortedFriends = friends.sort((a, b) => {
    // sort by playback status first
    if (!!b.playback?.updatedAt && !a.playback?.updatedAt) {
      return 1;
    } else if (!!a.playback?.updatedAt && !b.playback?.updatedAt) {
      return -1;
    }
    // then sort by name in alphabetical order
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  const currentUserData = users.filter((user) => user.userId === currentUserId)[0];

  useVisibilityChange((isVisible) => isVisible === true && !shouldRevalidate && revalidate());

  useEffect(() => {
    if (shouldRevalidate) {
      console.log('shouldRevalidate', shouldRevalidate);
      // revalidate();
    }
  }, [shouldRevalidate, revalidate]);

  return (
    <Stack pt={{ base: '53px', lg: 0 }} pb="100px" spacing={3} w="100%" px={['4px', 0]}>
      {currentUserData && currentUserData.settings?.miniPlayer && (
        <Stack w="100%" h="100%">
          {currentUserData.settings?.miniPlayer && (
            <PrismaMiniPlayer
              key={currentUserData.userId}
              user={currentUserData}
              currentUserId={currentUserId}
            />
          )}
        </Stack>
      )}
      {sortedFriends.map((user) => {
        return <PrismaMiniPlayer key={user.userId} user={user} currentUserId={currentUserId} />;
      })}
    </Stack>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const currentUser = session?.user ?? null;
  const users = await getAllUsers(!!currentUser);
  const currentUserId = currentUser?.id;

  return typedjson(
    { currentUserId, now: Date.now(), users },
    {
      headers: { 'Cache-Control': 'private, maxage=10, stale-while-revalidate=0' },
    },
  );
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export { CatchBoundary } from '~/components/error/CatchBoundary';
export default Friends;
