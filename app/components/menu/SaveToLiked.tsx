import { Image, MenuItem, Text } from '@chakra-ui/react';
import { useFetcher, useLocation, useParams } from '@remix-run/react';
import Waver from '../Waver';
import { useEffect, useState } from 'react';

type SaveToLikedProps = {
  trackId: string;
};

const SaveToLiked = ({ trackId }: SaveToLikedProps) => {
  const [isSaved, setIsSaved] = useState(true);
  const { id } = useParams();
  const fetcher = useFetcher();
  const isAdding = fetcher.submission?.formData.get('trackId') === trackId;
  const isDone = fetcher.type === 'done';
  const isError =
    typeof fetcher.data === 'string'
      ? fetcher.data.includes('Error')
        ? fetcher.data
        : null
      : null;
  const saveSong = () => {
    // const action = id ? `/${id}/save` : '/auth/spotify?returnTo=' + pathname + search;

    // const form = new FormData();

    // form.append('trackId', trackId);
    // form.append('isRemovable', isSaved ? 'hi' : '');

    // fetcher.submit(form, { replace: true, method: 'post', action });
    setIsSaved(!isSaved);
  };
  const text =
    id === undefined
      ? 'Log in to save a song'
      : isSaved
      ? 'Saved to Liked Songs'
      : 'Save to Liked Songs';
  const icon = isSaved ? <Image w="23px" src="heart.svg" /> : <Image w="23px" src="like.svg" />;
  // useEffect(() => {
  //   fetcher.load(`/${id}/save?trackId=${trackId}`);
  // }, []);
  // useEffect(() => {
  //   if (fetcher.data) {
  //     setIsSaved(fetcher.data);
  //   }
  // }, []);
  return (
    <MenuItem
      onClick={saveSong}
      icon={icon}
      isDisabled={!!isDone || !!isError || !!isAdding}
      closeOnSelect={false}
      mr={isSaved ? '0px' : '9.54px'}
    >
      {isAdding ? <Waver /> : text}
    </MenuItem>
  );
};

export default SaveToLiked;
