import { useSubmit, useParams } from '@remix-run/react';

import { Button, Text } from '@chakra-ui/react';

import useSessionUser from '~/hooks/useSessionUser';

const AddFriendsButton = () => {
  const currentUser = useSessionUser();
  const { id } = useParams();
  const isPending = currentUser?.user.friendsAdded.find(
    (friend) => friend.friendId === id && friend.status === 'pending',
  );
  const isAcceptable = currentUser?.user.friendsAddedMe.find(
    (friend) => friend.userId === id && friend.status === 'pending',
  );
  const isAccepted = currentUser?.user.friendsAdded.find(
    (friend) => friend.friendId === id && friend.status === 'accepted',
  );

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

  console.log({ currentUser });

  if (isAccepted) return null;

  return (
    <Button colorScheme="whiteAlpha" size="sm" onClick={handleClick} isDisabled={!!isPending}>
      {FriendsButtonText}
    </Button>
  );
};

export default AddFriendsButton;
