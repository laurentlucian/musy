import { Stack } from '@chakra-ui/react';

import PrismaMiniPlayer from '~/components/player/home/PrismaMiniPlayer';
import { useSearch } from '~/hooks/useSearchStore';
import useSessionUser from '~/hooks/useSessionUser';
import useUsers from '~/hooks/useUsers';
import type { Track } from '~/lib/types/types';

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

  const tracks: Track[] = [];
  for (let i = 0; i < sortedFriends.length; i++) {
    if (sortedFriends[i].playback === null || sortedFriends[i].playback?.track === undefined) {
      continue;
    }
    const track = {
      albumName: sortedFriends[i].playback!.track.albumName,
      albumUri: sortedFriends[i].playback!.track.albumUri,
      artist: sortedFriends[i].playback!.track.artist,
      artistUri: sortedFriends[i].playback!.track.artistUri,
      duration: sortedFriends[i].playback!.track.duration,
      explicit: sortedFriends[i].playback!.track.explicit,
      id: sortedFriends[i].playback!.track.id,
      image: sortedFriends[i].playback!.track.image,
      link: sortedFriends[i].playback!.track.link,
      name: sortedFriends[i].playback!.track.name,
      preview_url: sortedFriends[i].playback!.track.preview_url,
      uri: sortedFriends[i].playback!.track.uri,
    };
    tracks.push(track);
  }

  return (
    <Stack pt={0} pb="100px" spacing={3} w="100%" h="100%" px={['4px', 0]}>
      {searchedUsers.map((user, index) => {
        return (
          <PrismaMiniPlayer
            key={user.userId}
            layoutKey={'MiniPlayer' + index}
            user={user}
            currentUserId={currentUser?.userId}
            tracks={tracks}
            friendsTracks={[]}
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
