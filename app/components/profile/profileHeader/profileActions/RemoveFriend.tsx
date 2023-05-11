import { useParams, useSubmit } from '@remix-run/react';

import { MenuItem, useColorModeValue } from '@chakra-ui/react';

import { UserMinus } from 'iconsax-react';

import useSessionUser from '~/hooks/useSessionUser';

const RemoveFriend = () => {
  const currentUser = useSessionUser();
  const { id } = useParams();
  const submit = useSubmit();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.900');

  const isFriend = currentUser?.friendsList.find((friend) => friend.friendId === id);
  if (!isFriend) return null;

  const handleClick = () => {
    submit({ isFriend: 'true' }, { method: 'post', replace: true });
  };

  return (
    <MenuItem icon={<UserMinus size="18px" />} color={color} bg={bg} onClick={handleClick}>
      unfriend
    </MenuItem>
  );
};

export default RemoveFriend;
