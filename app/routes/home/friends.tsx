import { Stack } from '@chakra-ui/react';
import { useRevalidator } from '@remix-run/react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import type { LoaderArgs } from '@remix-run/node';
import { authenticator, getAllUsers } from '~/services/auth.server';
import PrismaMiniPlayer from '~/components/player/PrismaMiniPlayer';
import { useEffect } from 'react';
import useVisibilityChange from '~/hooks/useVisibilityChange';
import { useRevalidatorStore } from '~/hooks/useRevalidatorStore';

const Friends = () => {
  const { users } = useTypedLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  const shouldRevalidate = useRevalidatorStore((state) => state.shouldRevalidate);

  useVisibilityChange((isVisible) => isVisible === true && !shouldRevalidate && revalidate());

  useEffect(() => {
    if (shouldRevalidate) {
      revalidate();
    }
  }, [shouldRevalidate, revalidate]);

  return (
    <Stack pb="50px" pt={{ base: 4, md: 0 }} spacing={{ base: 4, md: 10 }}>
      <Stack>
        {users.map((user) => {
          return <PrismaMiniPlayer key={user.userId} user={user} />;
        })}
      </Stack>
    </Stack>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const currentUser = session?.user ?? null;
  const users = await getAllUsers(!!currentUser);

  return typedjson(
    { users, now: Date.now() },
    {
      headers: { 'Cache-Control': 'private, maxage=10, stale-while-revalidate=0' },
    },
  );
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export { CatchBoundary } from '~/components/error/CatchBoundary';
export default Friends;
