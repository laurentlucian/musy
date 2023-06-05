import { Stack } from '@chakra-ui/react';

import useFollowing from '~/hooks/useFollowing';
import { useRestOfUsers } from '~/hooks/useUsers';

import FullscreenFadeLayout from '../../shared/FullscreenFadeLayout';
import { useFullscreenTrack } from '../FullscreenTrack';
import QueueToFriend from './actions/queue/FriendButton';
import BackButton from './shared/BackButton';

const FullscreenTrackQueue = () => {
  const { track } = useFullscreenTrack();
  const following = useFollowing();
  const restOfUsers = useRestOfUsers();

  return (
    <FullscreenFadeLayout
      direction="column"
      justify="space-between"
      maxH={['unset', '450px']}
      overflow="hidden"
    >
      <BackButton />
      <Stack overflowX="hidden" w="100%">
        {[...following, ...restOfUsers].map((user) => (
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
