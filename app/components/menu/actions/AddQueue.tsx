import { Button, Image } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';
import { useTypedFetcher } from 'remix-typedjson';

import { useQueueData } from '~/hooks/useSendButton';
import useSessionUser from '~/hooks/useSessionUser';
import type { action } from '~/routes/$id/add';

import Waver from '../../icons/Waver';

type AddQueueProps = {
  fromId?: string | null;
  trackId: string;
  // this is used by ActivityFeed to let prisma know from who the track is from (who sent, or liked)
  user: Profile | null;
};

const AddQueue = ({ trackId, user }: AddQueueProps) => {
  const currentUser = useSessionUser();
  const fetcher = useTypedFetcher<typeof action>();
  const isSending = !!user;

  const { addToQueue, icon, isAdding, isDone, isError } = useQueueData({
    fetcher,
    trackId,
    userId: user?.userId,
  });
  const qText = isSending ? user?.name.split(/[ .]/)[0] : 'Add to Your Queue';

  const text = isDone ? (typeof fetcher.data === 'string' ? fetcher.data : 'Authenticated') : qText;

  return (
    <>
      {user ? (
        <Button // button to add to your friend's queue
          onClick={addToQueue}
          isDisabled={!!isDone || !!isError || !!isAdding}
          variant="ghost"
          justifyContent="left"
          fontSize="18px"
          py="30px"
          w={['100vw', '550px']}
          mt="10px"
        >
          <Image
            src={user?.image}
            borderRadius="full"
            boxSize="50px"
            minW="50px"
            mb={1}
            mr="10px"
          />
          {isAdding ? <Waver /> : text}
        </Button>
      ) : currentUser ? (
        <Button // button to add to your own queue
          onClick={addToQueue}
          leftIcon={icon}
          isDisabled={!!isDone || !!isError || !!isAdding}
          variant="ghost"
          justifyContent="left"
          fontSize="14px"
          w={['100vw', '550px']}
          _hover={{ color: 'white' }}
        >
          {isAdding ? <Waver /> : text}
        </Button>
      ) : (
        <Button // button to add to your own queue
          leftIcon={icon}
          variant="ghost"
          justifyContent="left"
          fontSize="14px"
          w={['100vw', '550px']}
          _hover={{ color: 'white' }}
          disabled
        >
          Log in to Add to Your Queue
        </Button>
      )}
    </>
  );
};

export default AddQueue;
