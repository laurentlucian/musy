import { useSubmit } from '@remix-run/react';

import { Button } from '@chakra-ui/react';

const AcceptOrRejectFriendButton = ({ accept, userId }: { accept: boolean; userId: string }) => {
  const submit = useSubmit();

  const handleSubmit = () => {
    submit(
      { clickStatus: accept ? 'accepted' : 'rejected', friendId: String(userId) },
      { method: 'post', replace: true },
    );
  };

  return (
    <Button colorScheme={accept ? 'green' : 'red'} onClick={handleSubmit} margin="5px">
      {accept ? 'Accept' : 'Reject'}
    </Button>
  );
};

export default AcceptOrRejectFriendButton;
