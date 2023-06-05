import { Send2 } from 'iconsax-react';

import { useFullscreen } from '../../Fullscreen';
import FullscreenQueue from '../../queue/FullscreenQueue';
import ActionButton from '../FullscreenActionButton';

const SearchAndSend = ({ userId }: { userId: string }) => {
  const { onOpen } = useFullscreen();

  return (
    <ActionButton leftIcon={<Send2 />} onClick={() => onOpen(<FullscreenQueue userId={userId} />)}>
      Send a song
    </ActionButton>
  );
};

export default SearchAndSend;
