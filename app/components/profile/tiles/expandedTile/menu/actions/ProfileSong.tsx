import { useFetcher } from '@remix-run/react';

import { Button } from '@chakra-ui/react';

import { Music } from 'iconsax-react';

import { useExpandedTile } from '~/hooks/useExpandedTileState';
import useSessionUser from '~/hooks/useSessionUser';

const ProfileSong = () => {
  const currentUser = useSessionUser();
  const fetcher = useFetcher();
  const track = useExpandedTile();

  const setAsProfileSong = () => {
    const data = {
      trackId: track?.id ?? '',
      userId: currentUser?.userId ?? '',
    };

    fetcher.submit(data, { action: 'api/track/profile', method: 'post', replace: true });
  };

  return currentUser ? (
    <Button
      onClick={setAsProfileSong}
      leftIcon={<Music />}
      mr="0px"
      variant="ghost"
      justifyContent="left"
      w={['100vw', '100%']}
      color="music.200"
      _hover={{ color: 'white' }}
    >
      Add as Profile Song
    </Button>
  ) : (
    <Button
      leftIcon={<Music />}
      mr="0px"
      variant="ghost"
      justifyContent="left"
      w={['100vw', '100%']}
      color="music.200"
      _hover={{ color: 'white' }}
      disabled
    >
      Log in to Add as Profile Song
    </Button>
  );
};

export default ProfileSong;
