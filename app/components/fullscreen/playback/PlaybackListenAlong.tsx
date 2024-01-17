import { MusicPlay } from 'iconsax-react';

import FullscreenActionButton from '../shared/FullscreenActionButton';

const PlaybackListenAlong = () => {
  return (
    <FullscreenActionButton leftIcon={<MusicPlay />}>
      <p className='line-through'>Listen along</p>
    </FullscreenActionButton>
  );
};

export default PlaybackListenAlong;
