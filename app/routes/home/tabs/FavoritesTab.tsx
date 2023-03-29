import { Stack, TabPanel } from '@chakra-ui/react';

import PrismaMiniPlayer from '~/components/player/home/PrismaMiniPlayer';
import type { Track } from '~/lib/types/types';

type Props = {
  currentUser: any;
  sortedFavorites: any;
};
export const FavoriteTab = ({ currentUser, sortedFavorites }: Props) => {
  const tracks: Track[] = [];
  for (let i = 0; i < sortedFavorites.length; i++) {
    if (sortedFavorites[i].playback === null || sortedFavorites[i].playback?.track === undefined) {
      continue;
    }
    const track = {
      albumName: sortedFavorites[i].playback!.track.albumName,
      albumUri: sortedFavorites[i].playback!.track.albumUri,
      artist: sortedFavorites[i].playback!.track.artist,
      artistUri: sortedFavorites[i].playback!.track.artistUri,
      duration: sortedFavorites[i].playback!.track.duration,
      explicit: sortedFavorites[i].playback!.track.explicit,
      id: sortedFavorites[i].playback!.track.id,
      image: sortedFavorites[i].playback!.track.image,
      link: sortedFavorites[i].playback!.track.link,
      name: sortedFavorites[i].playback!.track.name,
      preview_url: sortedFavorites[i].playback!.track.preview_url,
      uri: sortedFavorites[i].playback!.track.uri,
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
      {sortedFavorites.map((user, index) => {
        return (
          <PrismaMiniPlayer
            key={user.userId}
            layoutKey={'MiniPlayerF' + index}
            user={user}
            currentUserId={currentUser?.userId}
            tracks={tracks}
            friendsTracks={[]}
            index={index}
          />
        );
      })}
    </TabPanel>
  );
};
