import { Stack, TabPanel } from '@chakra-ui/react';

import type { Track } from '@prisma/client';

import PrismaMiniPlayer from '~/components/home/friends/friendsPlayer/PrismaMiniPlayer';
import useSessionUser from '~/hooks/useSessionUser';
import useUsers from '~/hooks/useUsers';

export const TempTab = () => {
  const users = useUsers();
  const currentUser = useSessionUser();

  const tracks: Track[] = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].playback === null || users[i].playback?.track === undefined) {
      continue;
    }
    const track = {
      albumName: users[i].playback!.track.albumName,
      albumUri: users[i].playback!.track.albumUri,
      artist: users[i].playback!.track.artist,
      artistUri: users[i].playback!.track.artistUri,
      duration: users[i].playback!.track.duration,
      explicit: users[i].playback!.track.explicit,
      id: users[i].playback!.track.id,
      image: users[i].playback!.track.image,
      link: users[i].playback!.track.link,
      name: users[i].playback!.track.name,
      preview_url: users[i].playback!.track.preview_url,
      uri: users[i].playback!.track.uri,
    };
    tracks.push(track);
  }
  return (
    <TabPanel
      as={Stack}
      pb="50px"
      pt={{ base: 4, md: 0 }}
      spacing={3}
      w="100%"
      h="100%"
      px={['4px', 0]}
    >
      {users.map((user, index) => {
        return (
          <PrismaMiniPlayer
            key={user.userId}
            layoutKey={'MiniPlayerF' + index}
            user={user}
            currentUserId={currentUser?.userId}
            tracks={tracks}
            index={index}
          />
        );
      })}
    </TabPanel>
  );
};
