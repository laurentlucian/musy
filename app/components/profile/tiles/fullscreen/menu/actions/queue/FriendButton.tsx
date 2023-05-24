import { Image } from '@chakra-ui/react';

import { useQueueToFriendData } from '~/hooks/useSendButton';
import Waver from '~/lib/icons/Waver';

import ActionButton from '../shared/ActionButton';

type QueueToFriendProps = {
  trackId: string;
  userId: string;
  userImage: string;
  username: string;
};

const FriendButton = ({ trackId, userId, userImage, username }: QueueToFriendProps) => {
  const { addToFriendsQueue, isAdding, isDone, isError, text } = useQueueToFriendData({
    trackId,
    userId,
    username,
  });

  return (
    <ActionButton
      leftIcon={<Image src={userImage} borderRadius="full" boxSize="50px" minW="50px" />}
      py="35px"
      onClick={addToFriendsQueue}
      isDisabled={!!isDone || !!isError || !!isAdding}
    >
      {isAdding ? <Waver /> : text}
    </ActionButton>
  );
};

export default FriendButton;
