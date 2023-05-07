import { Button } from '@chakra-ui/react';

import { useQueueToSelfData } from '~/hooks/useSendButton';
import useSessionUser from '~/hooks/useSessionUser';
import Waver from '~/lib/icons/Waver';

type QueueToSelfProps = {
  trackId: string;
};

const QueueToSelf = ({ trackId }: QueueToSelfProps) => {
  const currentUser = useSessionUser();

  const { addToSelfQueue, icon, isAdding, isDone, isError, text } = useQueueToSelfData({
    trackId,
  });

  return currentUser ? (
    <Button // button to add to your own queue
      onClick={addToSelfQueue}
      leftIcon={icon}
      isDisabled={!!isDone || !!isError || !!isAdding}
      variant="ghost"
      justifyContent="left"
      fontSize="14px"
      w={['100vw', '100%']}
      color="music.200"
      _hover={{ color: 'white' }}
    >
      {isAdding ? <Waver /> : text}
    </Button>
  ) : (
    <Button // placeholder button for logged out people
      leftIcon={icon}
      variant="ghost"
      justifyContent="left"
      fontSize="14px"
      w={['100vw', '100%']}
      color="music.200"
      _hover={{ color: 'white' }}
      disabled
    >
      Log in to Add to Your Queue
    </Button>
  );
};

export default QueueToSelf;
