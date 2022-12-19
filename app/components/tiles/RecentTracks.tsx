import { Stack } from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import Tile from '../Tile';
import Tiles from '../Tiles';

const RecentTracks = ({
  recent,
  currentUser,
  sendTo,
}: {
  recent: SpotifyApi.PlayHistoryObject[];
  currentUser: Profile | null;
  sendTo: string;
}) => {
  return (
    <Stack spacing={3}>
      <Tiles title="Recently played" scrollButtons={true}>
        {recent.map(({ track, played_at }) => {
          return (
            <Tile
              key={played_at}
              uri={track.uri}
              trackId={track.id}
              image={track.album.images[1].url}
              albumUri={track.album.uri}
              albumName={track.album.name}
              name={track.name}
              artist={track.album.artists[0].name}
              artistUri={track.album.artists[0].uri}
              explicit={track.explicit}
              user={currentUser}
              sendTo={sendTo}
            />
          );
        })}
      </Tiles>
    </Stack>
  );
};

export default RecentTracks;
