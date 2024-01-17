import clsx from 'clsx';

import { useFullscreen } from '~/components/fullscreen/Fullscreen';
import FullscreenPlayback from '~/components/fullscreen/playback/FullscreenPlayback';
import type { ProfileWithInfo } from '~/lib/types/types';
import { timeBetween, timeSince } from '~/lib/utils';

import TileTrackImage from '../track/TileTrackImage';

const TilePlaybackUser = ({ user }: { user: ProfileWithInfo }) => {
  const { onOpen } = useFullscreen();

  return (
    <div
      className={clsx(
        'group relative h-[150px] w-[150px] cursor-pointer overflow-hidden rounded-full border-[3px] md:h-[180px] md:w-[180px]',
        {
          'border-[rgba(255,255,255,0.5)]': !user.playback,
          'border-white': user.playback,
        },
      )}
      onClick={(e) => {
        e.preventDefault();
        onOpen(<FullscreenPlayback user={user} />);
      }}
    >
      <img
        className='h-[150px] w-[150px] object-cover md:h-[180px] md:w-[180px]'
        src={user.image}
        alt='user-profile'
      />
      <div className='absolute inset-0 rounded-full border-[3px] border-black' />
      <div className='duration-140 linear absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-[#10101066] opacity-0 backdrop-blur-sm backdrop-filter transition-opacity group-hover:opacity-100 md:backdrop-blur'>
        {user.playback ? (
          <TileTrackImage
            box='w-20 md:w-24'
            image={{
              className: 'cursor-pointer',
              src: user.playback?.track.image,
            }}
          />
        ) : (
          <p className='text-[12px] font-semibold uppercase sm:text-xs'>
            LISTENED FOR{' '}
            {timeBetween({
              endDate: user.playbacks[0].endedAt,
              startDate: user.playbacks[0].startedAt,
            })}
          </p>
        )}
        <p className='max-w-[22.5rem] overflow-hidden overflow-ellipsis whitespace-nowrap text-[11px] text-white sm:max-w-[27.5rem] sm:text-xs'>
          {user.playback?.track.artist ?? timeSince(user.playbacks[0]?.endedAt)}
        </p>
      </div>
    </div>
  );
};

export default TilePlaybackUser;
