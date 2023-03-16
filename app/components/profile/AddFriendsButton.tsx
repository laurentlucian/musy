import { useSubmit } from '@remix-run/react';
import { useEffect, useState } from 'react';

import { Button, Text } from '@chakra-ui/react';

import type { Friends } from '@prisma/client';

const AddFriendsButton = ({ status }: { status: Friends['status'] | null }) => {
  const [friendStatus, setFriendStatus] = useState(status);
  const submit = useSubmit();

  useEffect(() => {
    setFriendStatus(status);
  });

  const handleClick = async () => {
    submit({ friendStatus: 'requested' }, { method: 'post', replace: true });
    setFriendStatus(status);
  };

  const FriendsButtonText = () => {
    if (!friendStatus) {
      return <Text>Add Friend</Text>;
    }
    if (friendStatus === 'pending') {
      return <Text>Pending</Text>;
    }
    return null;
  };

  if (friendStatus === 'accepted') return null;
  else {
    return (
      <Button colorScheme="whiteAlpha" size={'sm'} onClick={handleClick}>
        <FriendsButtonText></FriendsButtonText>
      </Button>
    );
  }
};

export default AddFriendsButton;
