import { useSubmit } from '@remix-run/react';
import { useEffect, useState } from 'react';

import { Button, Text, Tooltip } from '@chakra-ui/react';

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
      console.log(' you are not friends');
      return <Text>Add Friend</Text>;
    }
    if (friendStatus === 'pending') {
      console.log('you are pending friends');
      return <Text>Pending</Text>;
    } else if (friendStatus === 'accepted') {
      console.log('you are friends');
      return <Text>Friends</Text>;
    }
    return null;
  };

  return (
    <Tooltip label="Add Friend ToolTip" placement="bottom-end" hasArrow>
      <Button colorScheme="whiteAlpha" size={'sm'} onClick={handleClick}>
        <FriendsButtonText></FriendsButtonText>
      </Button>
    </Tooltip>
  );
};

export default AddFriendsButton;
