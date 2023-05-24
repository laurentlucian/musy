import type { ButtonProps } from '@chakra-ui/react';

import { useQueueToSelfData } from '~/hooks/useSendButton';
import Waver from '~/lib/icons/Waver';

import ActionButton from '../shared/ActionButton';

type QueueToSelfProps = {
  trackId: string;
  withIcon?: boolean;
} & ButtonProps;

const AddToSelf = ({ trackId, withIcon, ...props }: QueueToSelfProps) => {
  const { addToSelfQueue, icon, isAdding, isDone, isError, text } = useQueueToSelfData({
    trackId,
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
