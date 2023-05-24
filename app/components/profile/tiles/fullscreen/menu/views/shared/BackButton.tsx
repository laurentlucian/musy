import { ArrowLeft2 } from 'iconsax-react';

import { useFullscreenTileView } from '../../../Wrapper';
import ActionButton from '../../actions/shared/ActionButton';

const BackButton = () => {
  const { setView } = useFullscreenTileView();

  return (
    <ActionButton leftIcon={<ArrowLeft2 />} onClick={() => setView('default')}>
      Go back
    </ActionButton>
  );
};

export default BackButton;
