import type { Activity } from '~/lib/types/types';

import TileTrackImage from '../tile/track/TileTrackImage';
import TileTrackInfo from '../tile/track/TileTrackInfo';
import ActivityInfo from './shared/ActivityInfo';
import ActivityTrackInfo from './shared/ActivityTrackInfo';

const ActivityTile = ({ activity }: { activity: Activity }) => {
  const track =
    activity.liked?.track ||
    activity.queue?.track ||
    activity.recommend?.track ||
    activity.playlist?.track;

  if (!track) return null;

  return (
    <div className='stack-2 w-full max-w-xl self-center'>
      <ActivityInfo activity={activity} />
      <div className='stack-1 w-full'>
        <div className='stack-3'>
          <TileTrackImage
            fullscreen={{
              originUserId: activity.userId,
              track,
            }}
            image={{
              className: 'min-h-[576px]',
              src: track.image,
            }}
          />

          <ActivityTrackInfo track={track} />
        </div>

        <TileTrackInfo track={track} createdAt={activity.createdAt} icon={false} />
      </div>
    </div>
  );
};

export default ActivityTile;
