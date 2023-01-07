import { Stack } from '@chakra-ui/react';
import Tiles from './Tiles';
import Tile from '../Tile';

const RecentTracks = ({ recent }: { recent: SpotifyApi.PlayHistoryObject[] }) => {
  const scrollButtons = recent.length > 5;
  return (
    <Stack spacing={3}>
      <Tiles title="Recently played" scrollButtons={scrollButtons}>
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
            />
          );
        })}
      </Tiles>
    </Stack>
  );
};

export default RecentTracks;
