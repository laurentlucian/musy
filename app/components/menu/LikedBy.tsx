import { Avatar, AvatarGroup, HStack, Text } from '@chakra-ui/react';

import { useDrawerTrack } from '~/hooks/useDrawer';

const LikedBy = () => {
  const track = useDrawerTrack();
  const users = track?.liked;

  if (!users) return null;

  return (
    <HStack minH={['30px', '45px']} pt="5px">
      <Text fontSize={['13px', '14px']} color="#BBB8B7">
        {users.length ? 'Liked by' : ''}
      </Text>
      <AvatarGroup border="pink">
        {users.map(({ user }) => (
          <Avatar key={user.userId} name={user.name} src={user.image} size={['xs', null, 'sm']} />
        ))}
      </AvatarGroup>
    </HStack>
  );
};

export default LikedBy;
