import { Messages1 } from 'iconsax-react';

import ActionButton from '../../../shared/FullscreenActionButton';
import { useFullscreenTrack } from '../../FullscreenTrack';

const Comment = () => {
  const { setView } = useFullscreenTrack();
  return (
    <ActionButton leftIcon={<Messages1 />} onClick={() => setView('comment')}>
      Comment
    </ActionButton>
  );
};

export default Comment;
