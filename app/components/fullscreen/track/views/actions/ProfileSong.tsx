import { useFetcher } from '@remix-run/react';

import { Music } from 'iconsax-react';

import useSessionUser from '~/hooks/useSessionUser';

import ActionButton from '../../../shared/FullscreenActionButton';
import { useFullscreenTrack } from '../../FullscreenTrack';

const ProfileSong = () => {
  const currentUser = useSessionUser();
  const fetcher = useFetcher();
  const { track } = useFullscreenTrack();

  const setAsProfileSong = () => {
    const data = {
      trackId: track.id,
      userId: currentUser?.userId ?? '',
    };

    fetcher.submit(data, { action: 'api/track/profile', method: 'post', replace: true });
  };

  return (
    <ActionButton onClick={setAsProfileSong} leftIcon={<Music />}>
      Add as Profile Song
    </ActionButton>
  );
};

export default ProfileSong;
