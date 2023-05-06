import { useSubmit, useParams } from '@remix-run/react';

import { Button, IconButton, Text, useColorModeValue } from '@chakra-ui/react';

import { UserAdd, UserMinus, UserTick } from 'iconsax-react';

import useSessionUser from '~/hooks/useSessionUser';

import Tooltip from '../Tooltip';

const AddFriendsButton = (props: { id?: string }) => {
  const color = useColorModeValue('#161616', '#EEE6E2');
  const currentUser = useSessionUser();
  const params = useParams();
  const id = props.id || params.id;
  const isPending = currentUser?.pendingList.find((user) => id === user.pendingFriendId);
  const isAcceptable = currentUser?.pendingListUserIsOn.find((item) => {
    return id === item.pendingFriendId; // someone double check this I am sleepy (will check later tho)
  });
  const isAccepted = currentUser?.friendsList.find((friend) => id === friend.friendId);

  const submit = useSubmit();

  const statusText = isAccepted
    ? 'friends'
    : isPending
    ? 'pending'
    : isAcceptable
    ? 'accept'
    : 'add friend';

  const icon = isAccepted ? (
    <UserTick />
  ) : isPending ? (
    <UserMinus />
  ) : isAcceptable ? (
    <UserAdd />
  ) : (
    <UserAdd />
  );

  return (
    <Tooltip label={statusText}>
      <IconButton
        aria-label={isAcceptable ? 'accept' : 'add friend'}
        variant="ghost"
        icon={icon}
        color={isAccepted ? 'spotify.green' : color}
        _hover={{ color: 'spotify.green' }}
        onClick={(e) => {
          e.preventDefault();
          submit(
            { friendStatus: 'requested' },
            { action: `/${id}`, method: 'post', replace: true },
          );
        }}
        isDisabled={!!isPending || !!isAccepted}
      />
    </Tooltip>
  );
};

export default AddFriendsButton;
