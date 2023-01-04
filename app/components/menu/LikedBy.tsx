import { Avatar, AvatarGroup, HStack, Text } from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import { useEffect, useState } from 'react';
import { useTypedFetcher } from 'remix-typedjson';
import { useDrawerTrack } from '~/hooks/useDrawer';
import type { loader } from '~/routes/$id/liked-by';

const LikedBy = () => {
  const track = useDrawerTrack();
  const { load, data } = useTypedFetcher<typeof loader>();
  const [users, setUsers] = useState<Profile[]>([]);

  useEffect(() => {
    if (!track) return;
    const timeout = setTimeout(() => load(`/${track.trackId}/liked-by`), 450);
    return () => clearTimeout(timeout);
  }, [track, load]);

  useEffect(() => {
    if (!data) return;
    setUsers(data);
  }, [data]);

  return (
    <HStack>
      <Text fontSize={['13px', '14px']} color="#BBB8B7">
        {users.length ? 'Liked by' : ''}
      </Text>
      <AvatarGroup>
        {users.map((user) => (
          <Avatar key={user.userId} name={user.name} src={user.image} size={['xs', null, 'sm']} />
        ))}
      </AvatarGroup>
    </HStack>
  );
};

export default LikedBy;
