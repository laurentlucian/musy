import { useLocation } from '@remix-run/react';

import { Button, IconButton, useColorModeValue } from '@chakra-ui/react';

import { useTypedFetcher } from 'remix-typedjson';

import Tooltip from '~/components/Tooltip';
import useSessionUser from '~/hooks/useSessionUser';
import useUserLibrary from '~/hooks/useUserLibrary';
import LikeIcon from '~/lib/icons/Like';

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
    if (!userId) {
      return fetcher.submit({}, { action: '/auth/spotify?returnTo=' + pathname + search });
    }

    fetcher.submit(
      { state: `${isSaved}`, trackId, userId },
      { action: 'api/track/save', method: 'post', replace: true },
    );
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
      w={['100vw', '100%']}
      color="music.200"
      _hover={{ color: 'white' }}
      disabled={!currentUser}
    >
      {currentUser ? (isSaved ? 'Remove' : 'Save') : 'Log in to Save'}
    </Button>
  );
};

export default SaveToLiked;
