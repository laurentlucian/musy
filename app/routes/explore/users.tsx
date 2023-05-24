import { Stack } from '@chakra-ui/react';

import MiniPlayer from '~/components/profile/player/MiniPlayer';
import { useSearch } from '~/hooks/useSearchStore';
import useSessionUser from '~/hooks/useSessionUser';
import useUsers from '~/hooks/useUsers';
import type { Track, TrackWithInfo } from '~/lib/types/types';

const Users = () => {
  const currentUser = useSessionUser();
  const users = useUsers();
  const search = useSearch();
  const sortedFriends = users.sort((a, b) => {
    if (!!b.playback?.updatedAt && !a.playback?.updatedAt) {
      return 1;
    } else if (!!a.playback?.updatedAt && !b.playback?.updatedAt) {
      return -1;
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  const searchedUsers = users.filter((user) => {
    if (search.trim() === '') {
      return user;
    } else {
      return user.name.toLowerCase().includes(search.toLowerCase());
    }
  });

  const tracks = [] as TrackWithInfo[];
  for (const friend of sortedFriends) {
    if (!friend.playback || !friend.playback) continue;
    tracks.push(friend.playback.track);
  }

  return (
    <Stack pt={0} pb="100px" spacing={3} w="100%" h="100%" px={['4px', 0]}>
      {searchedUsers.map((user, index) => {
        return (
          <MiniPlayer
            key={user.userId}
            layoutKey={'MiniPlayer' + index}
            user={user}
            currentUserId={currentUser?.userId}
            tracks={tracks}
            index={index}
          />
        );
      })}
    </Stack>
  );
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export { CatchBoundary } from '~/components/error/CatchBoundary';
export default Users;
