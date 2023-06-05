import { Stack, Flex } from '@chakra-ui/react';

import type { Activity, Track } from '~/lib/types/types';

import { useFullscreen } from '../fullscreen/Fullscreen';
import FullscreenTrack from '../fullscreen/track/FullscreenTrack';
import TileTrackImage from '../tile/track/TileTrackImage';
import TileTrackInfo from '../tile/track/TileTrackInfo';
import ActivityInfo from './shared/ActivityInfo';
import ActivityTrackInfo from './shared/ActivityTrackInfo';

interface ActivityTileProps {
  activity: Activity;
  index: number;
  layoutKey: string;
  tracks: Track[];
}

const ActivityTile = ({ activity, index, tracks }: ActivityTileProps) => {
  const { onOpen } = useFullscreen();
  const track = tracks[index];

  return (
    <Stack alignSelf="center">
      <ActivityInfo activity={activity} />
      <Flex pb="5px">
        <Stack spacing="5px">
          <Stack>
            <TileTrackImage
              image={{
                cursor: 'pointer',
                onClick: () =>
                  onOpen(<FullscreenTrack track={track} originUserId={activity.userId} />),
                src: track.image,
              }}
            />
            <ActivityTrackInfo track={track} />
          </Stack>

          <TileTrackInfo track={activity.track} createdAt={activity.createdAt} />
        </Stack>
      </Flex>
    </Stack>
  );
};

export default ActivityTile;
