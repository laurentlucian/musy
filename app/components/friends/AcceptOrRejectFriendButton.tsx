import { useSubmit } from '@remix-run/react';

import { Button } from '@chakra-ui/react';

const AcceptOrRejectFriendButton = ({ accept, userId }: { accept: Boolean; userId: String }) => {
  const submit = useSubmit();

  const SubmitClickAccept = async () => {
    submit(
      { clickStatus: 'accepted', friendId: String(userId) },
      { method: 'post', replace: true },
    );
  };

  const SubmitClickReject = async () => {
    submit(
      { clickStatus: 'rejected', friendId: String(userId) },
      { method: 'post', replace: true },
    );
  };

  if (accept) {
    return (
      <Button colorScheme="green" onClick={SubmitClickAccept} margin="5px">
        Accept
      </Button>
    );
  } else {
    return (
      <Button colorScheme="red" onClick={SubmitClickReject} margin="5px">
        Reject
      </Button>
    );
  }
};

export default AcceptOrRejectFriendButton;
