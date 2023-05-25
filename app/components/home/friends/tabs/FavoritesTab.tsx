import { Stack, TabPanel } from '@chakra-ui/react';

import type { Track } from '@prisma/client';

import MiniPlayer from '~/components/profile/player/MiniPlayer';
import useSessionUser from '~/hooks/useSessionUser';
import type { FriendCard, TrackWithInfo } from '~/lib/types/types';

type Props = {
  favorites: FriendCard[];
};
export const FavoriteTab = ({ favorites }: Props) => {
  const currentUser = useSessionUser();

  const tracks = [] as TrackWithInfo[];
  for (const track of favorites) {
    if (!track.playback) continue;
    tracks.push(track.playback.track);
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
          <MiniPlayer
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
