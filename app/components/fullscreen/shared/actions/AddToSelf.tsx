import { useQueueToSelfData } from '~/hooks/useSendButton';
import Waver from '~/lib/icons/Waver';

import ActionButton from '../FullscreenActionButton';

type QueueToSelfProps = {
  originUserId?: string;
  trackId: string;
  withIcon?: boolean;
};

const AddToSelf = ({ originUserId, trackId, withIcon }: QueueToSelfProps) => {
  const { addToSelfQueue, icon, isAdding, isDone, isError, text } = useQueueToSelfData({
    originUserId,
    trackId: trackId,
  });

  return (
    <ActionButton
      onClick={addToSelfQueue}
      leftIcon={withIcon ? icon : undefined}
      disabled={!!isDone || !!isError || !!isAdding}
    >
      {isAdding ? <Waver /> : text}
    </ActionButton>
  );
};

export default AddToSelf;
