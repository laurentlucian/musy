import { useParams } from '@remix-run/react';

import { IconButton, useColorModeValue } from '@chakra-ui/react';

import type { Track } from '@prisma/client';
import { useTypedFetcher } from 'remix-typedjson';

import useIsMobile from '~/hooks/useIsMobile';
import { useSendData } from '~/hooks/useSendButton';
import useSessionUser from '~/hooks/useSessionUser';
import type { action } from '~/routes/$id/add';
import type { action as actionB } from '~/routes/$id/recommend';

const SendButton = ({
  sendType = 'queue',
  sendingToId,
  track,
}: {
  sendType?: 'queue' | 'recommend';
  sendingToId?: string;
  track: Track;
}) => {
  const fetcherQ = useTypedFetcher<typeof action>();
  const fetcherR = useTypedFetcher<typeof actionB>();
  const isSmallScreen = useIsMobile();
  const currentUser = useSessionUser();
  const { id } = useParams();
  const profileId = id ?? sendingToId ?? '';
  const color = useColorModeValue(`${isSmallScreen ? 'music.200' : 'music.800'}`, 'music.200');
  const { handleSendButton, icon } = useSendData({
    fetcher: sendType === 'queue' ? fetcherQ : fetcherR,
    fromUserId: currentUser?.userId,
    profileId,
    sendType,
    track,
    trackId: track.id,
  });

  return (
    <IconButton
      onClick={handleSendButton}
      pos="relative"
      variant="ghost"
      color={color}
      icon={icon}
      _hover={{ color: 'white' }}
      aria-label={sendType ? 'add to this friends queue' : 'recommend to this friend'}
    />
  );
};

export default SendButton;
