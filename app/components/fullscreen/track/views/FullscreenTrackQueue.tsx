import { Stack } from '@chakra-ui/react';

import { useQueueableUsers } from '~/hooks/useUsers';

import FullscreenFadeLayout from '../../shared/FullscreenFadeLayout';
import { useFullscreenTrack } from '../FullscreenTrack';
import QueueToFriend from './actions/queue/FriendButton';
import BackButton from './shared/BackButton';

const FullscreenTrackQueue = () => {
  const { track } = useFullscreenTrack();
  const queueableUsers = useQueueableUsers();

  return (
    <FullscreenFadeLayout>
      <BackButton />
      <Stack overflowX="hidden">
        {queueableUsers.map((user) => (
          <QueueToFriend
            key={user.userId}
            trackId={track.id}
            userId={user.userId}
            userImage={user.image}
            username={user.name}
          />
        ))}
      </Stack>
    </FullscreenFadeLayout>
  );
};

export default FullscreenTrackQueue;
