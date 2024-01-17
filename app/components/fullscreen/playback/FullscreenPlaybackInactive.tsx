import { AnimatePresence, motion } from 'framer-motion';

import ActivityUserInfo from '~/components/activity/shared/ActivityUserInfo';
import TilePlaybackTracksImage from '~/components/tile/playback/inactive/TilePlaybackTracksImage';
import TileTrackImage from '~/components/tile/track/TileTrackImage';
import Tiles from '~/components/tiles/Tiles';
import usePlaybackTracks from '~/hooks/usePlaybackTracks';
import Waver from '~/lib/icons/Waver';
import type { ProfileWithInfo } from '~/lib/types/types';
import { timeBetween } from '~/lib/utils';

import PlaybackAddAll from './PlaybackAddAll';

const FullscreenPlaybackInactive = ({ user }: { user: ProfileWithInfo }) => {
  const tracks = usePlaybackTracks(user);

  const timeListened = (
    <p className='text-[10px] font-bold uppercase'>
      LISTENED FOR{' '}
      {timeBetween({
        endDate: user.playbacks[0].endedAt,
        startDate: user.playbacks[0].startedAt,
      })}
    </p>
  );

  if (!tracks || !tracks?.length)
    return (
      <div className='stack w-full items-center justify-center'>
        {timeListened}
        {tracks ? <p className='font-bolder text-[10px] uppercase'>no songs found</p> : <Waver />}
      </div>
    );

  return (
    <div className='grid grid-cols-1 content-start gap-4 overflow-hidden md:grid-cols-2 md:content-center'>
      <div className='stack-2 mx-auto mt-12 items-center md:mt-0 md:items-start'>
        <div className='stack-h-2 w-2/3 justify-between md:mt-[-42px]' id='dont-close'>
          <ActivityUserInfo user={user} />
          <div className='stack-h-2'>{timeListened}</div>
        </div>
        <TilePlaybackTracksImage
          tracks={tracks}
          fullscreen={{ originUserId: user.userId }}
          imageTw='w-2/3'
        />
      </div>
      <div className='stack grow overflow-x-hidden'>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: '1' }}
          >
            <Tiles>
              {tracks.slice(4).map((track, index) => (
                <TileTrackImage
                  key={index}
                  box='w-[180px]'
                  image={{ src: track.image }}
                  fullscreen={{
                    originUserId: user.userId,
                    track,
                  }}
                />
              ))}
            </Tiles>
          </motion.div>
        </AnimatePresence>
        {/* <PlaybackAddAll /> */}
      </div>
    </div>
  );
};

export default FullscreenPlaybackInactive;
