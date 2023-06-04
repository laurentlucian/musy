import { useLocation } from '@remix-run/react';
import { useState } from 'react';

import { useTypedFetcher } from 'remix-typedjson';

import useSessionUser from '~/hooks/useSessionUser';
import LikeIcon from '~/lib/icons/Like';
import Waver from '~/lib/icons/Waver';

import { useFullscreenTrack } from '../../FullscreenTrack';
import ActionButton from './shared/ActionButton';

const SaveToPlaylist = () => {
  const { track } = useFullscreenTrack();
  const [isSaved, setIsSaved] = useState(false);
  const currentUser = useSessionUser();
  const userId = currentUser?.userId;
  const fetcher = useTypedFetcher<string>();
  const { pathname, search } = useLocation();

  const saveSong = () => {
    setIsSaved(!isSaved);
    if (!userId) {
      return fetcher.submit({}, { action: '/auth/spotify?returnTo=' + pathname + search });
    }

    fetcher.submit(
      { trackId: track.id, userId },
      { action: 'api/playlist/save', method: 'post', replace: true },
    );
  };

  const isAdding = fetcher.formData?.get('trackId') === track.id;
  const isDone = fetcher.state === 'idle' && fetcher.data != null;
  const isError =
    typeof fetcher.data === 'string'
      ? fetcher.data.includes('Error')
        ? fetcher.data
        : null
      : null;

  return (
    <>
      <ActionButton
        onClick={saveSong}
        leftIcon={<LikeIcon aria-checked={isSaved} />}
        isDisabled={!!isDone || !!isError || !!isAdding}
      >
        {isAdding ? <Waver /> : fetcher.data ? fetcher.data : 'Save'}
      </ActionButton>
    </>
  );
};

export default SaveToPlaylist;
