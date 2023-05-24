import { Send2 } from 'iconsax-react';

import { useFullscreenTileView } from '../../../Wrapper';
import ActionButton from '../shared/ActionButton';

const AddToFriend = () => {
  const { setView } = useFullscreenTileView();
  return (
    <ActionButton leftIcon={<Send2 />} onClick={() => setView('queue')}>
      Add to friend&apos;s
    </ActionButton>
  );
};

export default AddToFriend;
