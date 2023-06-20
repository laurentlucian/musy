import type { BoxProps, SimpleGridProps } from '@chakra-ui/react';
import { SimpleGrid } from '@chakra-ui/react';

import type { TrackWithInfo } from '~/lib/types/types';

import TileTrackImage from '../../track/TileTrackImage';

const TilePlaybackTracksImage = ({
  fullscreen,
  image,
  tracks,
  ...props
}: {
  fullscreen?: {
    originUserId?: string;
  };
  image?: BoxProps;
  tracks: TrackWithInfo[];
} & SimpleGridProps) => {
  if (tracks.length === 0) return null;
  if (tracks.length <= 2)
    return (
      <TileTrackImage
        image={{ src: tracks[0].image, ...image }}
        fullscreen={fullscreen?.originUserId ? { track: tracks[0] } : undefined}
        box={{ ...props }}
      />
    );

  return (
    <SimpleGrid columns={2} {...props}>
      {tracks.slice(0, 4).map((track, index) => (
        <TileTrackImage
          key={index}
          fullscreen={fullscreen?.originUserId ? { track } : undefined}
          box={{ ...props }}
          image={{
            src: track.image,
            ...image,
          }}
        />
      ))}
    </SimpleGrid>
  );
};

export default TilePlaybackTracksImage;
