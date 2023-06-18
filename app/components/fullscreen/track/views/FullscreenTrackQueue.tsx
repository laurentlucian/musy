import { Stack } from '@chakra-ui/react';

import useFollowing from '~/hooks/useFollowing';

import FullscreenFadeLayout from '../../shared/FullscreenFadeLayout';
import { useFullscreenTrack } from '../FullscreenTrack';
import QueueToUser from './actions/queue/QueueToUser';
import BackButton from './shared/BackButton';

const FullscreenTrackQueue = () => {
  const { track } = useFullscreenTrack();
  const following = useFollowing(); // maybe only followers? eventually

  return (
    <FullscreenFadeLayout
      direction="column"
      justify="space-between"
      maxH={['unset', '450px']}
      overflow="hidden"
    >
      <BackButton />
      <Stack overflowX="hidden" w="100%">
        {following.map((user, index) => (
          <QueueToUser key={index} trackId={track.id} user={user} />
        ))}
      </Stack>
    </FullscreenFadeLayout>
  );
};

export default FullscreenTrackQueue;
