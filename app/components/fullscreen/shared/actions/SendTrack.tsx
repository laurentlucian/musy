import { useParams } from '@remix-run/react';

import type { IconButtonProps } from '@chakra-ui/react';
import { IconButton, useColorModeValue } from '@chakra-ui/react';

import Tooltip from '~/components/Tooltip';
import useIsMobile from '~/hooks/useIsMobile';
import { useQueueToFriendData } from '~/hooks/useSendButton';
import Waver from '~/lib/icons/Waver';

type SendButtonProps = {
  trackId: string;
  userId?: string;
} & Partial<IconButtonProps>;

const SendTrack = ({ trackId, userId, ...props }: SendButtonProps) => {
  const { id } = useParams();
  const toId = userId ?? id;
  if (!toId) throw new Error('Missing userId in <SendTrack />');

  const { addToFriendsQueue, icon, isAdding } = useQueueToFriendData({ trackId, userId: toId });
  const isSmallScreen = useIsMobile();
  const color = useColorModeValue(`${isSmallScreen ? 'musy.200' : 'musy.800'}`, 'musy.200');

  return (
    <Tooltip label="Add to their queue" placement="bottom">
      <IconButton
        onClick={addToFriendsQueue}
        pos="relative"
        variant="ghost"
        color={color}
        icon={isAdding ? <Waver /> : icon}
        _hover={{ color: 'white' }}
        aria-label="SEND"
        {...props}
      />
    </Tooltip>
  );
};

export default SendTrack;
