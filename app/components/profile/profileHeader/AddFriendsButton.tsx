import { useParams, useFetcher } from '@remix-run/react';

import { IconButton, useColorModeValue } from '@chakra-ui/react';

import { UserAdd, UserMinus, UserTick } from 'iconsax-react';

import Tooltip from '~/components/Tooltip';
import useSessionUser from '~/hooks/useSessionUser';

const AddFriendsButton = (props: { id?: string }) => {
  const color = useColorModeValue('#161616', '#EEE6E2');
  const currentUser = useSessionUser();
  const params = useParams();
  const id = (props.id || params.id) as string;
  const isPending = currentUser?.pendingList.find((user) => id === user.pendingFriendId);
  const isAcceptable = currentUser?.pendingListUserIsOn.find((item) => {
    return id === item.userId;
  });
  const isAccepted = currentUser?.friendsList.find((friend) => id === friend.friendId);

  const fetcher = useFetcher();

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
        isLoading={fetcher.formAction?.includes(id)}
        icon={icon}
        color={isAccepted ? 'spotify.green' : color}
        _hover={{ color: 'spotify.green' }}
        onClick={(e) => {
          e.preventDefault();
          fetcher.submit(
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
