import useFollowing from '~/hooks/useFollowing';

import FullscreenFadeLayout from '../../shared/FullscreenFadeLayout';
import { useFullscreenTrack } from '../FullscreenTrack';
import QueueToUser from './actions/queue/QueueToUser';
import BackButton from './shared/BackButton';

const FullscreenTrackQueue = () => {
  const { track } = useFullscreenTrack();
  const following = useFollowing();

  return (
    <FullscreenFadeLayout className='flex-col justify-between overflow-hidden md:max-h-[450px]'>
      <BackButton />
      <div className='stack w-full overflow-x-hidden'>
        {following.map((user, index) => (
          <QueueToUser key={index} trackId={track.id} user={user} />
        ))}
      </div>
    </FullscreenFadeLayout>
  );
};

export default FullscreenTrackQueue;
