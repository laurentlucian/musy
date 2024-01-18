import { useParams } from '@remix-run/react';

import { useQueueToFriendData } from '~/hooks/useSendButton';
import Waver from '~/lib/icons/Waver';

type SendButtonProps = {
  trackId: string;
  userId?: string;
};

const SendTrack = ({ trackId, userId }: SendButtonProps) => {
  const { id } = useParams();
  const toId = userId ?? id;
  if (!toId) throw new Error('Missing userId in <SendTrack />');

  const { addToFriendsQueue, icon, isAdding } = useQueueToFriendData({
    trackId,
    userId: toId,
  });

  return (
    <button
      className='relative text-musy-200 hover:text-white'
      onClick={addToFriendsQueue}
      aria-label='SEND'
    >
      {isAdding ? <Waver /> : icon}
    </button>
  );
};

export default SendTrack;
