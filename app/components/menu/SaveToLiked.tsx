import { Button, IconButton } from '@chakra-ui/react';
import { useLocation } from '@remix-run/react';
import { useTypedFetcher } from 'remix-typedjson';
import LikeIcon from '~/lib/icon/Like';
import useSessionUser from '~/hooks/useSessionUser';
import useUserLibrary from '~/hooks/useUserLibrary';
import Tooltip from '../Tooltip';
import { useState } from 'react';

type SaveToLikedProps = {
  trackId: string;
  iconOnly?: boolean;
};

const SaveToLiked = ({ trackId, iconOnly }: SaveToLikedProps) => {
  const currentUser = useSessionUser();
  const { isSaved, toggleSave } = useUserLibrary(trackId);
  const [hover, setHover] = useState(false);
  const fetcher = useTypedFetcher<string>();
  const { pathname, search } = useLocation();
  const userId = currentUser?.userId;

  const saveSong = () => {
    toggleSave(trackId);

    const action = userId ? `/${userId}/save` : '/auth/spotify?returnTo=' + pathname + search;

    fetcher.submit({ trackId, state: `${isSaved}` }, { replace: true, method: 'post', action });
  };

  if (iconOnly)
    return (
      <Tooltip label={isSaved ? 'Remove' : 'Save'}>
        <IconButton
          aria-label={isSaved ? 'Remove' : 'Save'}
          variant="ghost"
          icon={
            <LikeIcon
              aria-checked={isSaved}
              color={(hover && !isSaved) || (!hover && isSaved) ? 'spotify.green' : 'white'}
            />
          }
          boxShadow="none"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={saveSong}
        />
      </Tooltip>
    );

  return (
    <Button
      onClick={saveSong}
      leftIcon={<LikeIcon aria-checked={isSaved} />}
      mr="0px"
      variant="ghost"
      justifyContent="left"
      w={['100vw', '550px']}
      color="music.200"
      _hover={{ color: 'white' }}
    >
      {isSaved ? 'Remove' : 'Save'}
    </Button>
  );
};

export default SaveToLiked;
