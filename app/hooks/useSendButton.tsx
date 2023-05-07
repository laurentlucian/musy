import { AlertCircle, Check } from 'react-feather';

import { AddSquare, CloseSquare, Send2, TickSquare } from 'iconsax-react';
import { useTypedFetcher } from 'remix-typedjson';

import Waver from '~/lib/icons/Waver';
import type { action as addAction } from '~/routes/api/queue/add';
import type { action as sendAction } from '~/routes/api/queue/send';
import type { action as recommendAction } from '~/routes/api/recommend/send';

import { useDrawerFromId } from './useDrawer';
import useSessionUser from './useSessionUser';

type SelfQueueData = {
  trackId: string;
};

export type SendData = {
  trackId: string;
  userId: string;
  username?: string;
};

export const useRecommendData = ({ trackId, userId, username }: SendData) => {
  const currentUserId = useSessionUser()?.userId ?? '';
  const fetcher = useTypedFetcher<typeof recommendAction>();

  const data = {
    action: 'recommend',
    fromId: currentUserId,
    toId: userId ?? '',
    trackId,
  };

  const handleRecommend = (): void => {
    fetcher.submit(data, { action: '/api/recommend/send', method: 'post', replace: true });
  };

  const isAdding = fetcher.submission?.formData.get('trackId') === trackId;
  const isDone = fetcher.type === 'done';
  const isError = fetcher.data?.includes('Error') ? fetcher.data : null;

  const icon = isAdding ? (
    <Waver />
  ) : isDone ? (
    <Check />
  ) : isError ? (
    <AlertCircle />
  ) : (
    <Send2 variant="Bold" />
  );

  const qText = username?.split(/[ .]/)[0];

  const text = isDone ? (typeof fetcher.data === 'string' ? fetcher.data : 'Authenticated') : qText;

  return { Text, handleRecommend, icon, isAdding, isDone, isError, text };
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
    fetcher.submit(data, { action: '/api/queue/add', method: 'post', replace: true });
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

export const useQueueToFriendData = ({ trackId, userId: toId, username = '' }: SendData) => {
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
    fetcher.submit(data, { action: '/api/queue/send', method: 'post', replace: true });
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
    <Send2 variant="Outline" />
  );

  const qText = username.split(/[ .]/)[0];
  const text = isDone ? (typeof fetcher.data === 'string' ? fetcher.data : 'Authenticated') : qText;

  return { addToFriendsQueue, icon, isAdding, isDone, isError, text };
};
