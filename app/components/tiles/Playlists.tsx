import { Stack } from '@chakra-ui/react';
import Tile from '../Tile';
import Tiles from '../Tiles';

const Playlists = ({
  playlists: initialPlaylists,
}: {
  playlists: SpotifyApi.PlaylistObjectSimplified[];
}) => {
  const playlists = initialPlaylists;
  if (!playlists) return null;

  return (
    <Stack spacing={3}>
      <Tiles title="Playlists" scrollButtons>
        {playlists.map((list, played_at) => {
          return (
            <Tile
              playlist
              key={played_at}
              uri={list.uri}
              image={list.images[0]?.url}
              albumUri={list.uri}
              albumName={list.name}
              name={list.name}
              artist={list.description}
              artistUri={null}
              explicit={false}
              user={null}
            />
          );
        })}
      </Tiles>
    </Stack>
  );
};

export default Playlists;
