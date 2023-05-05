import { useSubmit, useParams } from '@remix-run/react';

import { Button, Text } from '@chakra-ui/react';

import useSessionUser from '~/hooks/useSessionUser';

const AddFriendsButton = () => {
  const currentUser = useSessionUser();
  const { id } = useParams();
  const isPending = currentUser?.pendingList.find((user) => id === user.pendingFriendId);
  const isAcceptable = currentUser?.pendingListUserIsOn.find((item) => {
    return id === item.pendingFriendId; // someone double check this I am sleepy (will check later tho)
  });
  const isAccepted = currentUser?.friendsList.find((friend) => id === friend.friendId);

  const submit = useSubmit();

  const handleClick = () => {
    submit({ friendStatus: 'requested' }, { method: 'post', replace: true });
  };

  const FriendsButtonText = isPending ? (
    <Text>Pending</Text>
  ) : isAcceptable ? (
    <Text>Accept</Text>
  ) : (
    <Text>Add Friend</Text>
  );

  if (isAccepted) return null;

  return (
    <Button colorScheme="whiteAlpha" size="sm" onClick={handleClick} isDisabled={!!isPending}>
      {FriendsButtonText}
    </Button>
  );
};

export default AddFriendsButton;
