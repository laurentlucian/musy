import { Stack } from '@chakra-ui/react';

import { useQueueableUsers } from '~/hooks/useUsers';

import { useFullscreenTrack } from '../FullscreenTrack';
import QueueToFriend from './actions/queue/FriendButton';
import BackButton from './shared/BackButton';
import FadeLayout from './shared/FadeLayout';

const QueueList = () => {
  const { track } = useFullscreenTrack();
  const queueableUsers = useQueueableUsers();

  return (
    <FadeLayout>
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
    </FadeLayout>
  );
};

export default QueueList;
