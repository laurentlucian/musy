import { useSubmit } from '@remix-run/react';

import { Button } from '@chakra-ui/react';

const AcceptOrRejectFriendButton = ({ accept, userId }: { accept: Boolean; userId: String }) => {
  const submit = useSubmit();

  const handleClick = async () => {
    submit({ acceptFriend: String(accept) }, { method: 'post', replace: true });
  };

  if (accept) {
    return (
      <Button colorScheme="green" onClick={handleClick}>
        Accept
      </Button>
    );
  } else {
    return (
      <Button colorScheme="red" onClick={handleClick}>
        Reject
      </Button>
    );
  }
};

export default AcceptOrRejectFriendButton;
