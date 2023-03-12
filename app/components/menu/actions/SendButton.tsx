import { useParams } from '@remix-run/react';
import { AlertCircle, Check } from 'react-feather';

import { IconButton, useColorModeValue } from '@chakra-ui/react';

import type { Track } from '@prisma/client';
import { Send2 } from 'iconsax-react';
import { useTypedFetcher } from 'remix-typedjson';

import Waver from '~/components/icons/Waver';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';
import type { action } from '~/routes/$id/add';
import type { action as actionB } from '~/routes/$id/recommend';

// if send type is true you are queueing otherwise you are recommending

const SendButton = ({
  sendType = true,
  sendingToId,
  track,
}: {
  sendType?: boolean;
  sendingToId?: string;
  track: Track;
}) => {
  const fetcherQ = useTypedFetcher<typeof action>();
  const fetcherR = useTypedFetcher<typeof actionB>();
  const isSmallScreen = useIsMobile();
  const currentUser = useSessionUser();
  const { id } = useParams();
  const profileId = id ?? sendingToId;
  const color = useColorModeValue(`${isSmallScreen ? 'music.200' : 'music.800'}`, 'music.200');
  const handleSendButton = () => {
    const action = sendType ? `/${profileId}/add` : `/${profileId}/recommend`;

    const fromUserId = currentUser?.userId;
    const sendToUserId = profileId;

    const queueData = {
      action: 'send',

      fromId: fromUserId ?? '',
      toId: sendToUserId ?? '',
      trackId: track.id,
    };

    const recommendData = {
      action: 'recommend',
      albumName: track.albumName,
      albumUri: track.albumUri,
      artist: track.artist,
      artistUri: track.artistUri,
      comment: '',
      explicit: track.explicit ? 'true' : '',
      fromId: fromUserId ?? '',
      image: track.image,
      link: track.link,
      name: track.name,
      preview_url: track.preview_url ?? '',

      toId: sendToUserId ?? '',
      trackId: track.id,
      uri: track.uri,
    };
    if (fetcherQ && sendType) {
      fetcherQ.submit(queueData, { action, method: 'post', replace: true });
    }
    if (fetcherR && !sendType) {
      fetcherR.submit(recommendData, { action, method: 'post', replace: true });
    }
  };

  let isAdding = null;

  if (sendType) {
    isAdding = fetcherQ.submission?.formData.get('trackId') === track.id;
  } else {
    isAdding = fetcherR.submission?.formData.get('trackId') === track.id;
  }
  let isDone = null;
  isDone = sendType ? fetcherQ.type === 'done' : fetcherR.type === 'done';
  let isError = null;

  if (fetcherQ && typeof fetcherQ.data === 'string') {
    if (fetcherQ.data.includes('Error')) {
      isError = fetcherQ.data;
    } else if (fetcherR && typeof fetcherR.data === 'string') {
      if (fetcherR.data.includes('Error')) {
        isError = fetcherR.data;
      }
    }
  }

  const icon = isAdding ? (
    <Waver />
  ) : isDone ? (
    <Check />
  ) : isError ? (
    <AlertCircle />
  ) : (
    <Send2 variant={sendType ? 'Outline' : 'Bold'} />
  );
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
