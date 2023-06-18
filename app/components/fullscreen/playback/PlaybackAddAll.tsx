import { Text } from '@chakra-ui/react';

import { MusicPlay } from 'iconsax-react';

import FullscreenActionButton from '../shared/FullscreenActionButton';

const PlaybackAddAll = () => {
  return (
    <FullscreenActionButton leftIcon={<MusicPlay />}>
      <Text textDecoration="line-through">Add all to queue</Text>
    </FullscreenActionButton>
  );
};

export default PlaybackAddAll;
