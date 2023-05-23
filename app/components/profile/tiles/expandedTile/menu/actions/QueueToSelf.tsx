import type { ButtonProps } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';

import { useQueueToSelfData } from '~/hooks/useSendButton';
import Waver from '~/lib/icons/Waver';

type QueueToSelfProps = {
  trackId: string;
  withIcon?: boolean;
} & ButtonProps;

const QueueToSelf = ({ trackId, withIcon, ...props }: QueueToSelfProps) => {
  const { addToSelfQueue, icon, isAdding, isDone, isError, text } = useQueueToSelfData({
    trackId,
  });

  return (
    <Button
      onClick={addToSelfQueue}
      leftIcon={withIcon ? icon : undefined}
      isDisabled={!!isDone || !!isError || !!isAdding}
      variant="ghost"
      justifyContent="left"
      {...props}
    >
      {isAdding ? <Waver /> : text}
    </Button>
  );
};

export default QueueToSelf;
