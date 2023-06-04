import { Send2 } from 'iconsax-react';

import { useFullscreenTrack } from '../../FullscreenTrack';
import ActionButton from './shared/ActionButton';

const AddToFriend = () => {
  const { setView } = useFullscreenTrack();
  return (
    <ActionButton leftIcon={<Send2 />} onClick={() => setView('queue')}>
      Add to friend&apos;s
    </ActionButton>
  );
};

export default AddToFriend;
