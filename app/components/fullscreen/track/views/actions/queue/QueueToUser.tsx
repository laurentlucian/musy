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
      leftIcon={
        <img className='h-[50px] w-[50px] rounded-full' src={user.image} alt='user-profile' />
      }
      onClick={addToFriendsQueue}
      disabled={!!isDone || !!isError || !!isAdding}
    >
      {isAdding ? <Waver /> : text}
    </ActionButton>
  );
};

export default QueueToUser;
