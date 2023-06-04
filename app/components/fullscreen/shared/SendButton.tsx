import { useParams } from '@remix-run/react';

import type { IconButtonProps } from '@chakra-ui/react';
import { IconButton, useColorModeValue } from '@chakra-ui/react';

import useIsMobile from '~/hooks/useIsMobile';
import { useQueueToFriendData } from '~/hooks/useSendButton';

type SendButtonProps = {
  trackId: string;
  userId?: string;
} & Partial<IconButtonProps>;

const SendButton = ({ trackId, userId, ...props }: SendButtonProps) => {
  const { id } = useParams();
  const toId = userId ?? id;
  if (!toId) throw new Error('Missing userId in <SendButton />');

  const { addToFriendsQueue, icon } = useQueueToFriendData({ trackId, userId: toId });
  const isSmallScreen = useIsMobile();
  const color = useColorModeValue(`${isSmallScreen ? 'musy.200' : 'musy.800'}`, 'musy.200');

  return (
    <IconButton
      onClick={addToFriendsQueue}
      pos="relative"
      variant="ghost"
      color={color}
      icon={icon}
      _hover={{ color: 'white' }}
      aria-label="SEND"
      {...props}
    />
  );
};

export default SendButton;
