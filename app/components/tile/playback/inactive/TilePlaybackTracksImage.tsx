import type { TrackWithInfo } from '~/lib/types/types';

import TileTrackImage from '../../track/TileTrackImage';

const TilePlaybackTracksImage = ({
  fullscreen,
  imageTw,
  tracks,
}: {
  fullscreen?: {
    originUserId?: string;
  };
  imageTw?: string;
  tracks: TrackWithInfo[];
}) => {
  if (tracks.length === 0) return null;
  if (tracks.length <= 2)
    return (
      <TileTrackImage
        image={{ className: imageTw, src: tracks[0].image }}
        fullscreen={fullscreen?.originUserId ? { track: tracks[0] } : undefined}
      />
    );

  return (
    <div className='grid grid-cols-2'>
      {tracks.slice(0, 4).map((track, index) => (
        <TileTrackImage
          key={index}
          fullscreen={fullscreen?.originUserId ? { track } : undefined}
          image={{
            // className: imageTw,
            src: track.image,
          }}
        />
      ))}
    </div>
  );
};

export default TilePlaybackTracksImage;
