import { Button, IconButton } from '@chakra-ui/react';
import { useLocation } from '@remix-run/react';
import { useTypedFetcher } from 'remix-typedjson';
import LikeIcon from '~/lib/icon/Like';
import useSessionUser from '~/hooks/useSessionUser';
import useUserLibrary from '~/hooks/useUserLibrary';
import Tooltip from '../Tooltip';

type SaveToLikedProps = {
  trackId: string;
  iconOnly?: boolean;
};

const SaveToLiked = ({ trackId, iconOnly }: SaveToLikedProps) => {
  const currentUser = useSessionUser();
  const { isSaved, toggleSave } = useUserLibrary(trackId);
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
      <Tooltip label={isSaved ? 'remove' : 'save'} placement="top">
        <IconButton
          aria-label={isSaved ? 'remove' : 'save'}
          variant="ghost"
          icon={
            <LikeIcon
              aria-checked={isSaved}
              color={isSaved ? 'spotify.green' : 'white'}
              _hover={{ color: 'spotify.green' }}
            />
          }
          _hover={{ boxShadow: 'none' }}
          _active={{ boxShadow: 'none' }}
          boxShadow="none"
          // onMouseEnter={() => setHover(true)} //this does not work because when the icon changes
          // onMouseLeave={() => setHover(false)} //it is as if the mouse has left the icon even though you haven't moved the mouse off it yet
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
