import { useLocation } from '@remix-run/react';

import { Button, IconButton, useColorModeValue } from '@chakra-ui/react';

import { useTypedFetcher } from 'remix-typedjson';

import useSessionUser from '~/hooks/useSessionUser';
import useUserLibrary from '~/hooks/useUserLibrary';
import LikeIcon from '~/lib/icon/Like';

import Tooltip from '../../Tooltip';

type SaveToLikedProps = {
  iconOnly?: boolean;
  trackId: string;
};

const SaveToLiked = ({ iconOnly, trackId }: SaveToLikedProps) => {
  const currentUser = useSessionUser();
  const { isSaved, toggleSave } = useUserLibrary(trackId);
  const fetcher = useTypedFetcher<string>();
  const { pathname, search } = useLocation();
  const userId = currentUser?.userId;
  const color = useColorModeValue('#161616', '#EEE6E2');

  const saveSong = () => {
    toggleSave(trackId);

    const action = userId ? `/${userId}/save` : '/auth/spotify?returnTo=' + pathname + search;

    fetcher.submit({ state: `${isSaved}`, trackId }, { action, method: 'post', replace: true });
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
              color={isSaved ? 'spotify.green' : color}
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
      disabled={!currentUser}
    >
      {currentUser ? (isSaved ? 'Remove' : 'Save') : 'Log in to Save'}
    </Button>
  );
};

export default SaveToLiked;
