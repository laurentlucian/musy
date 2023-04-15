import { Stack, TabPanel } from '@chakra-ui/react';

import type { Playback, Profile, Settings, Track } from '@prisma/client';

import PrismaMiniPlayer from '~/components/player/home/PrismaMiniPlayer';
import useSessionUser from '~/hooks/useSessionUser';

type Props = {
  everyone: (Profile & {
    playback:
      | (Playback & {
          track: Track & {
            liked: {
              user: Profile;
            }[];
            recent: {
              user: Profile;
            }[];
          };
        })
      | null;
    settings: Settings | null;
  })[];
};
export const TempTab = ({ everyone }: Props) => {
  const currentUser = useSessionUser();
  const tracks: Track[] = [];
  for (let i = 0; i < everyone.length; i++) {
    if (everyone[i].playback === null || everyone[i].playback?.track === undefined) {
      continue;
    }
    const track = {
      albumName: everyone[i].playback!.track.albumName,
      albumUri: everyone[i].playback!.track.albumUri,
      artist: everyone[i].playback!.track.artist,
      artistUri: everyone[i].playback!.track.artistUri,
      duration: everyone[i].playback!.track.duration,
      explicit: everyone[i].playback!.track.explicit,
      id: everyone[i].playback!.track.id,
      image: everyone[i].playback!.track.image,
      link: everyone[i].playback!.track.link,
      name: everyone[i].playback!.track.name,
      preview_url: everyone[i].playback!.track.preview_url,
      uri: everyone[i].playback!.track.uri,
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
      {everyone.map((user, index) => {
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
