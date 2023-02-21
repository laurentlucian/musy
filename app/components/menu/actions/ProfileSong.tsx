import { Button } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';
import { Music } from 'iconsax-react';
import { useTypedFetcher } from 'remix-typedjson';

import { useDrawerTrack } from '~/hooks/useDrawer';
import useSessionUser from '~/hooks/useSessionUser';
import type { action } from '~/routes/$id/profileSong';

const ProfileSong = ({ user }: { user: Profile | null }) => {
  const currentUser = useSessionUser();
  const fetcher = useTypedFetcher<typeof action>();
  const track = useDrawerTrack();

  const setAsProfileSong = () => {
    const id = currentUser?.userId;
    const action = `/${id}/profileSong`;
    const data = {
      trackId: track?.id ?? '',
    };

    fetcher.submit(data, { action, method: 'post', replace: true });
  };

  return currentUser ? (
    <Button
      onClick={setAsProfileSong}
      leftIcon={<Music />}
      mr="0px"
      variant="ghost"
      justifyContent="left"
      w={['100vw', '550px']}
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
      w={['100vw', '550px']}
      color="music.200"
      _hover={{ color: 'white' }}
      disabled
    >
      Log in to Add as Profile Song
    </Button>
  );
};

export default ProfileSong;
