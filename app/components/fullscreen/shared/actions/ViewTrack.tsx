import { Text } from '@chakra-ui/react';

import { MoreCircle } from 'iconsax-react';

import type { TrackWithInfo } from '~/lib/types/types';

import { useFullscreen } from '../../Fullscreen';
import FullscreenTrack from '../../track/FullscreenTrack';
import FullscreenActionButton from '../FullscreenActionButton';

const ViewTrack = (props: { track: TrackWithInfo; userId?: string }) => {
  const { onOpen } = useFullscreen();
  return (
    <FullscreenActionButton
      leftIcon={<MoreCircle />}
      onClick={() => onOpen(<FullscreenTrack track={props.track} originUserId={props.userId} />)}
    >
      <Text>View song</Text>
    </FullscreenActionButton>
  );
};

export default ViewTrack;
