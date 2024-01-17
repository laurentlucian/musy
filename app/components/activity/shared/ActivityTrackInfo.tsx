import LikedBy from '~/components/activity/LikedBy';
import PlayedBy from '~/components/activity/PlayedBy';
import QueuedBy from '~/components/activity/QueuedBy';
import explicitImage from '~/lib/assets/explicit-solid.svg';
import { cn } from '~/lib/cn';
import SpotifyLogo from '~/lib/icons/SpotifyLogo';
import type { TrackWithInfo } from '~/lib/types/types';

const ActivityTrackInfo = ({ className, track }: { className?: string; track: TrackWithInfo }) => {
  const willOverflow =
    (track.liked && track.liked.length >= 5 && track.recent && track.recent.length >= 5) ||
    (track.queue && track.queue.length >= 5);

  return (
    <div className={cn('flex items-start justify-between', className)} id='dont-close'>
      <div className='stack-h-3'>
        <LikedBy liked={track.liked} slice={willOverflow ? 2 : 5} />
        <PlayedBy played={track.recent} slice={willOverflow ? 2 : 5} />
        <QueuedBy queued={track.queue} slice={willOverflow ? 2 : 5} />
      </div>
      <div className='stack-h-3'>
        {track.explicit && <img className='ml-auto w-[15px]' src={explicitImage} alt='explicit' />}
        <SpotifyLogo icon w='21px' h='21px' />
      </div>
    </div>
  );
};

export default ActivityTrackInfo;
