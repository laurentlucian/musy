import { Stack, TabPanel } from '@chakra-ui/react';

import type { Track } from '@prisma/client';

import PrismaMiniPlayer from '~/components/home/friends/friendsPlayer/PrismaMiniPlayer';
import useSessionUser from '~/hooks/useSessionUser';
import type { FriendCard } from '~/lib/types/types';

type Props = {
  favorites: FriendCard[];
};
export const FavoriteTab = ({ favorites }: Props) => {
  const currentUser = useSessionUser();
  const tracks: Track[] = [];
  for (let i = 0; i < favorites.length; i++) {
    if (favorites[i].playback === null || favorites[i].playback?.track === undefined) {
      continue;
    }
    const track = {
      albumName: favorites[i].playback!.track.albumName,
      albumUri: favorites[i].playback!.track.albumUri,
      artist: favorites[i].playback!.track.artist,
      artistUri: favorites[i].playback!.track.artistUri,
      duration: favorites[i].playback!.track.duration,
      explicit: favorites[i].playback!.track.explicit,
      id: favorites[i].playback!.track.id,
      image: favorites[i].playback!.track.image,
      link: favorites[i].playback!.track.link,
      name: favorites[i].playback!.track.name,
      preview_url: favorites[i].playback!.track.preview_url,
      uri: favorites[i].playback!.track.uri,
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
      {favorites.map((user, index) => {
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
