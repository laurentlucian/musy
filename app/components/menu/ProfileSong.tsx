import { useLocation, useSubmit } from '@remix-run/react';
import type { action } from '~/routes/$id/profileSong';
import useSessionUser from '~/hooks/useSessionUser';
import { useDrawerTrack } from '~/hooks/useDrawer';
import { useTypedFetcher } from 'remix-typedjson';
import type { Profile } from '@prisma/client';
import { Button } from '@chakra-ui/react';
import { Music } from 'iconsax-react';

const ProfileSong = ({ user }: { user: Profile | null }) => {
  const currentUser = useSessionUser();
  const submit = useSubmit();
  const fetcher = useTypedFetcher<typeof action>();
  const { pathname, search } = useLocation();
  const track = useDrawerTrack();

  const setAsProfileSong = () => {
    if (!currentUser) {
      return submit(null, {
        replace: true,
        method: 'post',
        action: '/auth/spotify?returnTo=' + pathname + search,
      });
    }

    const id = currentUser?.userId;
    const action = `/${id}/profileSong`;
    const data = {
      trackId: track?.trackId ?? '',
    };

    fetcher.submit(data, { replace: true, method: 'post', action });
  };

  return (
    <>
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
        Add as Offline Song
      </Button>
    </>
  );
};

export default ProfileSong;
