import { useParams } from '@remix-run/react';

import { IconButton, useColorModeValue } from '@chakra-ui/react';

import useIsMobile from '~/hooks/useIsMobile';
import type { SendData } from '~/hooks/useSendButton';
import { useQueueToFriendData, useRecommendData } from '~/hooks/useSendButton';

const RecommendButton = ({ trackId, userId }: SendData) => {
  const isSmallScreen = useIsMobile();
  const { handleRecommend, icon } = useRecommendData({ trackId, userId });
  const color = useColorModeValue(`${isSmallScreen ? 'musy.200' : 'musy.800'}`, 'musy.200');

  return (
    <IconButton
      onClick={handleRecommend}
      pos="relative"
      variant="ghost"
      color={color}
      icon={icon}
      _hover={{ color: 'white' }}
      aria-label="recommend to this friend"
    />
  );
};

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

const SendButton = ({
  sendType = 'queue',
  sendingToId,
  trackId,
}: {
  sendType?: 'queue' | 'recommend';
  sendingToId?: string;
  trackId: string;
}) => {
  const { id } = useParams();
  const toId = sendingToId ?? id ?? '';

  return sendType === 'queue' ? (
    <QueueButton trackId={trackId} userId={toId} />
  ) : (
    <RecommendButton trackId={trackId} userId={toId} />
  );
};

export default SendButton;
