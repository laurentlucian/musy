import { ArrowLeft2 } from 'iconsax-react';

import { useFullscreenTrack } from '../../FullscreenTrack';
import ActionButton from '../actions/shared/ActionButton';

const BackButton = () => {
  const { setView } = useFullscreenTrack();

  return (
    <ActionButton leftIcon={<ArrowLeft2 />} onClick={() => setView('default')}>
      Go back
    </ActionButton>
  );
};

export default BackButton;
