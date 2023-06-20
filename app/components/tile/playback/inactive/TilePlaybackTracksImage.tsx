import type { SimpleGridProps } from '@chakra-ui/react';
import { SimpleGrid } from '@chakra-ui/react';

import type { TrackWithInfo } from '~/lib/types/types';

import TileTrackImage from '../../track/TileTrackImage';

const TilePlaybackTracksImage = ({
  tracks,
  ...props
}: {
  fullscreen?: {
    originUserId?: string;
  };
  tracks: TrackWithInfo[];
} & SimpleGridProps) => {
  if (tracks.length === 0) return null;
  if (tracks.length <= 2)
    return <TileTrackImage image={{ src: tracks[0].image }} box={{ ...props }} />;

  return (
    <SimpleGrid columns={2} {...props}>
      {tracks.slice(0, 4).map((track, index) => (
        <TileTrackImage
          key={index}
          fullscreen={props.fullscreen?.originUserId ? { track } : undefined}
          image={{
            src: track.image,
          }}
        />
      ))}
    </SimpleGrid>
  );
};

export default TilePlaybackTracksImage;
