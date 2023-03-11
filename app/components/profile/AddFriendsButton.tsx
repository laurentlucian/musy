//import { useSubmit } from '@remix-run/react';
import { useState } from 'react';

import { Button, Text, Tooltip } from '@chakra-ui/react';

import type { Friends } from '@prisma/client';

//import { prisma } from '~/services/db.server';

// import { getCurrentUser } from '~/services/auth.server';
// import useSessionUser from '~/hooks/useSessionUser';

const AddFriendsButton = ({ status }: { status: Friends['status'] | null }) => {
  //const submit = useSubmit();
  //set the initial state of the button to be "Add as Friend"
  //const [friendStatus, setFriendStatus] = useState({ status });
  //onCLick make an update to prisma db that adds to the friends table
  //with friendId with id of current profile and userId with
  //current user id and status with pending

  const handleClick = async () => {
    // await prisma.friends.upsert({
    //   where: {
    //     userId_friendId: {
    //       userId:
    //       friendId: 2,
    //     },
    //   },
    //   update: {
    //     status: 'accepted',
    //   },
  };

  const FriendsButtonText = () => {
    if (!status) return <Text>Add Friend</Text>;
    console.log('status is ' + status);
    if (status === 'pending') {
      console.log('you are pending friends');
      return <Text>Pending</Text>;
    } else if (status === 'accepted') {
      console.log('you are friends');
      return <Text>Friends</Text>;
    } else {
      console.log('you are not friends');
      return <Text>Add Friend</Text>;
    }
  };

  return (
    <Tooltip label="Add Friends" placement="bottom-end" hasArrow>
      <Button colorScheme="whiteAlpha" size={'sm'} onClick={handleClick}>
        <FriendsButtonText></FriendsButtonText>
      </Button>
    </Tooltip>
  );
};

export default AddFriendsButton;
