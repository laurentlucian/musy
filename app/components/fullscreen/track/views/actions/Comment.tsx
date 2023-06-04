import { Messages1 } from 'iconsax-react';

import { useFullscreenTrack } from '../../FullscreenTrack';
import ActionButton from './shared/ActionButton';

const Comment = () => {
  const { setView } = useFullscreenTrack();
  return (
    <ActionButton leftIcon={<Messages1 />} onClick={() => setView('comment')}>
      Comment
    </ActionButton>
  );
};

export default Comment;
