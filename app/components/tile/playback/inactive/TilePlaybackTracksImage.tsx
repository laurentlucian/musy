import type { SimpleGridProps } from '@chakra-ui/react';
import { SimpleGrid } from '@chakra-ui/react';

import type { ProfileWithInfo, TrackWithInfo } from '~/lib/types/types';

import TileTrackImage from '../../track/TileTrackImage';

export const getPlaybackTracks = (user: ProfileWithInfo) => {
  const startedAt = user.playbacks[0].startedAt.getTime();
  const endedAt = user.playbacks[0].endedAt.getTime();

  return user.recent
    .filter((r) => {
      const playedAt = r.playedAt.getTime();
      if (playedAt > startedAt && playedAt < endedAt) {
        return true;
      }
      return false;
    })
    .map((r) => r.track);
};

const TilePlaybackTracksImage = ({
  tracks,
  ...props
}: {
  fullscreen?: {
    originUserId?: string;
  };
  tracks: TrackWithInfo[];
} & SimpleGridProps) => {
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
