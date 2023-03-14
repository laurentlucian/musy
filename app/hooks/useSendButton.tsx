import { AlertCircle, Check } from 'react-feather';

import type { Track } from '@prisma/client';
import { AddSquare, CloseSquare, Send2, TickSquare } from 'iconsax-react';
import type { TypedFetcherWithComponents } from 'remix-typedjson';

import Waver from '~/components/icons/Waver';

import { useDrawerFromId } from './useDrawer';
import useSessionUser from './useSessionUser';

type SendButton = {
  fetcher: TypedFetcherWithComponents<string>;
  fromUserId: string | undefined;
  profileId: string;
  sendType?: 'queue' | 'recommend';
  track: Track;
  trackId: string;
  userId?: string;
};
type QueueData = {
  fetcher: TypedFetcherWithComponents<string>;
  trackId: string;
  userId?: string;
};
export const useSendData = ({
  fetcher,
  fromUserId,
  profileId,
  sendType = 'queue',
  track,
  trackId,
}: SendButton) => {
  const queueData = {
    action: 'send',

    fromId: fromUserId ?? '',
    toId: profileId ?? '',
    trackId: trackId ?? '',
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

    toId: profileId ?? '',
    trackId: track.id,
    uri: track.uri,
  };

  const handleSendButton = () => {
    const action = sendType === 'queue' ? `/${profileId}/add` : `/${profileId}/recommend`;

    if (sendType === 'queue') {
      fetcher.submit(queueData, { action, method: 'post', replace: true });
    } else {
      fetcher.submit(recommendData, { action, method: 'post', replace: true });
    }
  };

  const isAdding =
    fetcher.submission?.formData.get('trackId') === (sendType === 'queue' ? trackId : track.id);
  const isDone = fetcher.type === 'done';
  const isError = fetcher.data?.includes('Error') ? fetcher.data : null;

  const icon = isAdding ? (
    <Waver />
  ) : isDone ? (
    <Check />
  ) : isError ? (
    <AlertCircle />
  ) : (
    <Send2 variant={sendType === 'queue' ? 'Outline' : 'Bold'} />
  );

  return { handleSendButton, icon, isAdding, isDone, isError };
};

export const useQueueData = ({ fetcher, trackId, userId }: QueueData) => {
  const currentUser = useSessionUser();
  const fromId = useDrawerFromId();
  const id = fromId || userId;
  const isSending = !!userId;
  const fromUserId = isSending ? currentUser?.userId : id;
  const sendToUserId = isSending ? id : currentUser?.userId;
  const action = isSending
    ? `/${id ?? currentUser?.userId}/add`
    : `/${currentUser?.userId ?? id}/add`;

  const data = {
    action: isSending ? 'send' : 'add',

    fromId: fromUserId ?? '',
    toId: sendToUserId ?? '',
    trackId,
  };

  const addToQueue = () => {
    fetcher.submit(data, { action, method: 'post', replace: true });
  };
  const isAdding = fetcher.submission?.formData.get('trackId') === trackId;

  const isDone = fetcher.type === 'done';
  const isError =
    typeof fetcher.data === 'string'
      ? fetcher.data.includes('Error')
        ? fetcher.data
        : null
      : null;
  const icon = isDone ? (
    <TickSquare size="25px" />
  ) : isError ? (
    <CloseSquare size="25px" />
  ) : isSending ? (
    <Send2 />
  ) : (
    <AddSquare />
  );

  return { addToQueue, icon, isAdding, isDone, isError };
};
