import { Image } from '@chakra-ui/react';

import { useQueueToFriendData } from '~/hooks/useSendButton';
import Waver from '~/lib/icons/Waver';
import type { ProfileWithInfo } from '~/lib/types/types';

import ActionButton from '../../../../shared/FullscreenActionButton';

type QueueToUserProps = {
  trackId: string;
  user: ProfileWithInfo;
};

const QueueToUser = ({ trackId, user }: QueueToUserProps) => {
  const { addToFriendsQueue, isAdding, isDone, isError, text } = useQueueToFriendData({
    trackId,
    userId: user.userId,
    username: user.name,
  });

  return (
    <ActionButton
      leftIcon={<Image src={user.image} borderRadius="full" boxSize="50px" minW="50px" />}
      py="35px"
      onClick={addToFriendsQueue}
      isDisabled={!!isDone || !!isError || !!isAdding}
    >
      {isAdding ? <Waver /> : text}
    </ActionButton>
  );
};

export default QueueToUser;
