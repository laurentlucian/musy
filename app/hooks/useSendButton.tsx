import { useParams } from '@remix-run/react';
import { AlertCircle, Check } from 'react-feather';

import { DirectInbox, CloseSquare, Send2, TickSquare, Star1 } from 'iconsax-react';
import { useTypedFetcher } from 'remix-typedjson';

import Waver from '~/lib/icons/Waver';
import type { action as addAction } from '~/routes/api/queue/add';
import type { action as sendAction } from '~/routes/api/queue/send';
import type { action as recommendAction } from '~/routes/api/recommend/add';

import { useSessionUserId } from './useSessionUser';
import { useUserRecommended } from './useUserLibrary';

type SelfQueueData = {
  originUserId?: string;
  trackId: string;
};

export type SendData = {
  trackId: string;
  userId: string;
  username?: string;
};

export const useRecommendData = (trackId: string) => {
  const fetcher = useTypedFetcher<typeof recommendAction>();
  const { isRecommended, toggleRecommend } = useUserRecommended(trackId);

  const action = isRecommended ? 'api/recommend/remove' : 'api/recommend/add';

  const handleRecommend = (): void => {
    toggleRecommend();
    fetcher.submit({ trackId }, { action, method: 'post', replace: true });
  };

  const isAdding = fetcher.formData?.get('trackId') === trackId;
  const isDone = fetcher.state === 'idle' && fetcher.data != null;
  const isError = fetcher.data?.includes('Error') ? fetcher.data : null;

  const isDisabled = !!isError || !!isAdding;

  const icon = isAdding ? (
    <Waver />
  ) : isDone ? (
    <Check />
  ) : isError ? (
    <AlertCircle />
  ) : (
    <Send2 variant="Bold" />
  );

  const leftIcon = isRecommended ? <Star1 variant="Bold" /> : <Star1 />;

  const child = isAdding ? (
    <Waver />
  ) : isRecommended ? (
    'Recommended'
  ) : fetcher.data ? (
    fetcher.data
  ) : (
    'Recommend'
  );

  return { child, handleRecommend, icon, isDisabled, leftIcon };
};

export const useQueueToSelfData = ({ originUserId, trackId }: SelfQueueData) => {
  const currentUserId = useSessionUserId();
  const { id } = useParams();
  const data = {
    fromId: originUserId ?? id ?? currentUserId ?? '',
    trackId,
  };

  const fetcher = useTypedFetcher<typeof addAction>();

  const addToSelfQueue = () => {
    fetcher.submit(data, { action: '/api/queue/add', method: 'post', replace: true });
  };
  const isAdding = fetcher.formData?.get('trackId') === trackId;

  const isDone = fetcher.state === 'idle' && fetcher.data != null;
  const isError = fetcher.data ? (fetcher.data.includes('Error') ? fetcher.data : null) : null;
  const icon = isDone ? (
    <TickSquare size="25px" />
  ) : isError ? (
    <CloseSquare size="25px" />
  ) : (
    <DirectInbox />
  );

  const text = isDone ? (fetcher.data ? fetcher.data : 'Authenticated') : 'Add to queue';

  return { addToSelfQueue, icon, isAdding, isDone, isError, text };
};

export const useQueueToFriendData = ({ trackId, userId: toId, username = '' }: SendData) => {
  const data = {
    toId,
    trackId,
  };

  const fetcher = useTypedFetcher<typeof sendAction>();

  const addToFriendsQueue = () => {
    fetcher.submit(data, { action: '/api/queue/send', method: 'post', replace: true });
  };
  const isAdding = fetcher.formData?.get('trackId') === trackId;

  const isDone = fetcher.state === 'idle' && fetcher.data != null;

  const isError = fetcher.data ? (fetcher.data.includes('Error') ? fetcher.data : null) : null;

  const icon = isDone ? (
    <TickSquare size="25px" />
  ) : isError ? (
    <CloseSquare size="25px" />
  ) : (
    <Send2 variant="Outline" size="25px" />
  );

  const text = isDone ? (fetcher.data ? fetcher.data : 'Authenticated') : username.split(/[ .]/)[0];

  return { addToFriendsQueue, icon, isAdding, isDone, isError, text };
};
