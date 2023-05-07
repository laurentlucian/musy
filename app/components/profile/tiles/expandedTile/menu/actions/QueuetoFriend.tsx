import { Button, Image } from '@chakra-ui/react';

import { useQueueToFriendData } from '~/hooks/useSendButton';

import Waver from '../../../../../../lib/icons/Waver';

type QueueToFriendProps = {
  trackId: string;
  userId: string;
  userImage: string;
  username: string;
};

const QueueToFriend = ({ trackId, userId, userImage, username }: QueueToFriendProps) => {
  const { addToFriendsQueue, isAdding, isDone, isError, text } = useQueueToFriendData({
    trackId,
    userId,
    username,
  });

  return (
    <Button
      onClick={addToFriendsQueue}
      isDisabled={!!isDone || !!isError || !!isAdding}
      variant="ghost"
      justifyContent="left"
      fontSize="18px"
      color="music.200"
      py="30px"
      w={['100vw', '100%']}
      mt="10px"
    >
      <Image src={userImage} borderRadius="full" boxSize="50px" minW="50px" mb={1} mr="10px" />
      {isAdding ? <Waver /> : text}
    </Button>
  );
};

export default QueueToFriend;
