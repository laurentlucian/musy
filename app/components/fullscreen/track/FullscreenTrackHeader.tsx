import ActivityTrackInfo from '~/components/activity/shared/ActivityTrackInfo';
import TileTrackImage from '~/components/tile/track/TileTrackImage';

import TrackInfo from '../shared/FullscreenTrackInfo';
import { useFullscreenTrack } from './FullscreenTrack';

const FullscreenTrackHeader = () => {
  const { track } = useFullscreenTrack();

  return (
    <div className='stack-1 mx-auto mt-12 items-center md:mt-0 md:items-start'>
      <div className='stack-2 w-[65%]'>
        <TileTrackImage image={{ src: track.image }} />
        <ActivityTrackInfo track={track} className='w-full' />
      </div>
      <TrackInfo track={track} />
    </div>
  );
};

export default FullscreenTrackHeader;
