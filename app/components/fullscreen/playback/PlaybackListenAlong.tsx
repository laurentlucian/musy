import { Text } from '@chakra-ui/react';

import { MusicPlay } from 'iconsax-react';

import FullscreenActionButton from '../shared/FullscreenActionButton';

const PlaybackListenAlong = () => {
  return (
    <FullscreenActionButton leftIcon={<MusicPlay />}>
      <Text textDecoration="line-through">Listen along</Text>
    </FullscreenActionButton>
  );
};

export default PlaybackListenAlong;
