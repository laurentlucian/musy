import { useParams } from '@remix-run/react';

import { IconButton, useColorModeValue } from '@chakra-ui/react';

import useIsMobile from '~/hooks/useIsMobile';
import type { SendData } from '~/hooks/useSendButton';
import { useQueueToFriendData } from '~/hooks/useSendButton';

const QueueButton = ({ trackId, userId }: SendData) => {
  const isSmallScreen = useIsMobile();
  const { addToFriendsQueue, icon } = useQueueToFriendData({ trackId, userId });
  const color = useColorModeValue(`${isSmallScreen ? 'musy.200' : 'musy.800'}`, 'musy.200');

  return (
    <IconButton
      onClick={addToFriendsQueue}
      pos="relative"
      variant="ghost"
      color={color}
      icon={icon}
      _hover={{ color: 'white' }}
      aria-label="add to this friends queue"
    />
  );
};

const SendButton = ({ sendingToId, trackId }: { sendingToId?: string; trackId: string }) => {
  const { id } = useParams();
  const toId = sendingToId ?? id ?? '';

  return <QueueButton trackId={trackId} userId={toId} />;
};

export default SendButton;
