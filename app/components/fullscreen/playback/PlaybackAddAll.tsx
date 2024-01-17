import { MusicPlay } from 'iconsax-react';

import FullscreenActionButton from '../shared/FullscreenActionButton';

const PlaybackAddAll = () => {
  return (
    <FullscreenActionButton leftIcon={<MusicPlay />}>
      <p className='line-through'>Add all to queue</p>
    </FullscreenActionButton>
  );
};

export default PlaybackAddAll;
