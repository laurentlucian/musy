import { Stack } from '@chakra-ui/react';

import ActivityTrackInfo from '~/components/activity/shared/ActivityTrackInfo';
import TileTrackImage from '~/components/tile/track/TileTrackImage';

import TrackInfo from '../shared/FullscreenTrackInfo';
import { useFullscreenTrack } from './FullscreenTrack';

const FullscreenTrackHeader = () => {
  const { track } = useFullscreenTrack();

  return (
    <Stack align={['center', 'start']} mt={['50px', '0px']} mx="auto">
      <Stack direction="column" w="65%">
        <TileTrackImage image={{ src: track.image }} />
        <ActivityTrackInfo track={track} w="100%" />
      </Stack>
      <TrackInfo track={track} />
    </Stack>
  );
};

export default FullscreenTrackHeader;
