import { Button } from '@chakra-ui/react';
import { useLocation } from '@remix-run/react';
import Waver from '../Waver';
import { useState } from 'react';
import { useTypedFetcher } from 'remix-typedjson';
import LikeIcon from '~/lib/icon/Like';
import useSessionUser from '~/hooks/useSessionUser';

type SaveToLikedProps = {
  trackId: string;
};

const SaveToLiked = ({ trackId }: SaveToLikedProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const currentUser = useSessionUser();
  const userId = currentUser?.userId;
  const fetcher = useTypedFetcher<string>();
  const { pathname, search } = useLocation();

  const saveSong = () => {
    setIsSaved(!isSaved);
    const action = userId ? `/${userId}/save` : '/auth/spotify?returnTo=' + pathname + search;

    fetcher.submit({ trackId }, { replace: true, method: 'post', action });
  };

  // useEffect(() => {
  //   fetcher.load(`/${id}/save?trackId=${trackId}`);
  // }, []);
  // useEffect(() => {
  //   if (fetcher.data) {
  //     setIsSaved(fetcher.data);
  //   }
  // }, []);

  // const text =
  //   id === undefined
  //     ? 'Log in to save a song'
  //     : isSaved
  //     ? 'Saved to Liked Songs'
  //     : 'Save to Liked Songs';
  const isAdding = fetcher.submission?.formData.get('trackId') === trackId;
  const isDone = fetcher.type === 'done';
  const isError =
    typeof fetcher.data === 'string'
      ? fetcher.data.includes('Error')
        ? fetcher.data
        : null
      : null;

  return (
    <>
      <Button
        onClick={saveSong}
        leftIcon={<LikeIcon aria-checked={isSaved} />}
        isDisabled={!!isDone || !!isError || !!isAdding}
        mr="0px"
        variant="ghost"
        justifyContent="left"
        w={['100vw', '550px']}
      >
        {isAdding ? <Waver /> : fetcher.data ? fetcher.data : 'Save'}
      </Button>
    </>
  );
};

export default SaveToLiked;
