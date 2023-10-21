import { useFetcher } from '@remix-run/react';

import { Music } from 'iconsax-react';

import useCurrentUser from '~/hooks/useCurrentUser';

import ActionButton from '../../../shared/FullscreenActionButton';
import { useFullscreenTrack } from '../../FullscreenTrack';

const ProfileSong = () => {
  const currentUser = useCurrentUser();
  const fetcher = useFetcher();
  const { track } = useFullscreenTrack();

  const setAsProfileSong = () => {
    const data = {
      trackId: track.id,
      userId: currentUser?.userId ?? '',
    };

    fetcher.submit(data, { action: 'api/track/profile', method: 'POST', replace: true });
  };

  return (
    <ActionButton onClick={setAsProfileSong} leftIcon={<Music />}>
      Add as Profile Song
    </ActionButton>
  );
};

export default ProfileSong;
