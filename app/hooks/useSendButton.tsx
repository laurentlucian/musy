import { AlertCircle, Check } from 'react-feather';

import type { Track } from '@prisma/client';
import { AddSquare, CloseSquare, Send2, TickSquare } from 'iconsax-react';
import type { TypedFetcherWithComponents } from 'remix-typedjson';
import { useTypedFetcher } from 'remix-typedjson';

import Waver from '~/components/icons/Waver';
import type { action as addAction } from '~/routes/api/add';
import type { action as sendAction } from '~/routes/api/send';

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

type SelfQueueData = {
  trackId: string;
};

export const useQueueToSelfData = ({ trackId }: SelfQueueData) => {
  const currentUserId = useSessionUser()?.userId ?? '';
  const fromId = useDrawerFromId() ?? '';

  const data = {
    action: 'add',
    fromId,
    toId: currentUserId,
    trackId,
  };

  const fetcher = useTypedFetcher<typeof addAction>();

  const addToSelfQueue = () => {
    fetcher.submit(data, { action: 'api/add', method: 'post', replace: true });
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
  ) : (
    <AddSquare />
  );

  const text = isDone
    ? typeof fetcher.data === 'string'
      ? fetcher.data
      : 'Authenticated'
    : 'Add to Your Queue';

  return { addToSelfQueue, icon, isAdding, isDone, isError, text };
};

type SendData = {
  trackId: string;
  userId: string;
  username: string;
};

export const useQueueToFriendData = ({ trackId, userId: toId, username }: SendData) => {
  const currentUserId = useSessionUser()?.userId ?? '';

  const data = {
    action: 'send',
    fromId: currentUserId,
    toId: toId ?? '',
    toUsername: username,
    trackId,
  };

  const fetcher = useTypedFetcher<typeof sendAction>();

  const addToFriendsQueue = () => {
    fetcher.submit(data, { action: 'api/send', method: 'post', replace: true });
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
  ) : (
    <Send2 />
  );

  const qText = username.split(/[ .]/)[0];
  const text = isDone ? (typeof fetcher.data === 'string' ? fetcher.data : 'Authenticated') : qText;

  return { addToFriendsQueue, icon, isAdding, isDone, isError, text };
};
