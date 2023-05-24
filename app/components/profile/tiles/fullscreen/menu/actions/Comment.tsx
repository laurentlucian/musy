import { Messages1 } from 'iconsax-react';

import { useFullscreenTileView } from '../../Wrapper';
import ActionButton from './shared/ActionButton';

const Comment = () => {
  const { setView } = useFullscreenTileView();
  return (
    <ActionButton leftIcon={<Messages1 />} onClick={() => setView('comment')}>
      Comment
    </ActionButton>
  );
};

export default Comment;
