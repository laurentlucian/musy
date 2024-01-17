import { Send2 } from 'iconsax-react';

import ActionButton from '../../../shared/FullscreenActionButton';
import { useFullscreenTrack } from '../../FullscreenTrack';

const SendToFriends = () => {
  const { setView } = useFullscreenTrack();
  return (
    <ActionButton leftIcon={<Send2 />} onClick={() => setView('queue')}>
      Add to friend&apos;s
    </ActionButton>
  );
};

export default SendToFriends;
