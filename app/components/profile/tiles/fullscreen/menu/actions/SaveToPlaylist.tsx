import { useLocation } from '@remix-run/react';
import { useState } from 'react';

import { useTypedFetcher } from 'remix-typedjson';

import useSessionUser from '~/hooks/useSessionUser';
import LikeIcon from '~/lib/icons/Like';
import Waver from '~/lib/icons/Waver';

import ActionButton from './shared/ActionButton';

type SaveToPlaylistProps = {
  trackId: string;
};

const SaveToPlaylist = ({ trackId }: SaveToPlaylistProps) => {
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
      { trackId, userId },
      { action: 'api/playlist/save', method: 'post', replace: true },
    );
  };

  const isAdding = fetcher.formData?.get('trackId') === trackId;
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
