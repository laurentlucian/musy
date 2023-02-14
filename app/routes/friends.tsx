import type { LoaderArgs } from '@remix-run/node';
import { useRevalidator } from '@remix-run/react';
import { useEffect } from 'react';
import { Users } from 'react-feather';

import { Divider, HStack, Icon, Stack, Text, useColorModeValue } from '@chakra-ui/react';

import { Profile2User } from 'iconsax-react';
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

  const bg = useColorModeValue('#EEE6E2', '#050404');
  const color = useColorModeValue('#111111', '#DFD7D1');

  useVisibilityChange((isVisible) => isVisible === true && !shouldRevalidate && revalidate());

  useEffect(() => {
    if (shouldRevalidate) {
      console.log('shouldRevalidate', shouldRevalidate);
      // revalidate();
    }
  }, [shouldRevalidate, revalidate]);

  return (
    <Stack pb="100px" spacing={3} w="100%" px={['4px', 0]}>
      <Stack pos="sticky" top={0} zIndex={1} bg={bg}>
        <HStack>
          <Icon as={Users} color={color} />
          <Text fontSize="sm" fontWeight="400">
            friends
          </Text>
          <Text fontSize="xs" fontWeight="300">
            ~ {friends.length}
          </Text>
        </HStack>
        <Divider bgColor={color} />
      </Stack>
      {friends.map((user) => {
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
