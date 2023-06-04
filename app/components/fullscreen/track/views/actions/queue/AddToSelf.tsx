import type { ButtonProps } from '@chakra-ui/react';

import { useQueueToSelfData } from '~/hooks/useSendButton';
import Waver from '~/lib/icons/Waver';

import { useFullscreenTrack } from '../../../FullscreenTrack';
import ActionButton from '../shared/ActionButton';

type QueueToSelfProps = {
  withIcon?: boolean;
} & ButtonProps;

const AddToSelf = ({ withIcon, ...props }: QueueToSelfProps) => {
  const { originUserId, track } = useFullscreenTrack();
  const { addToSelfQueue, icon, isAdding, isDone, isError, text } = useQueueToSelfData({
    originUserId,
    trackId: track.id,
  });

  return (
    <ActionButton
      onClick={addToSelfQueue}
      leftIcon={withIcon ? icon : undefined}
      isDisabled={!!isDone || !!isError || !!isAdding}
      {...props}
    >
      {isAdding ? <Waver /> : text}
    </ActionButton>
  );
};

export default AddToSelf;
