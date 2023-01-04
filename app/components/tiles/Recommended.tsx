import { Stack } from '@chakra-ui/react';
import type { RecommendedSongs } from '@prisma/client';
import Tile from '../Tile';
import Tiles from './Tiles';

const Recommended = ({ recommended }: { recommended: RecommendedSongs[] }) => {
  return (
    <>
      {recommended.length > 0 && (
        <Stack spacing={3}>
          <Tiles title="Recommended" scrollButtons={true}>
            {recommended.map((recommended) => {
              return (
                <Tile
                  key={recommended.id}
                  uri={recommended.uri}
                  trackId={recommended.trackId}
                  image={recommended.image}
                  albumUri={recommended.albumUri}
                  albumName={recommended.albumName}
                  name={recommended.name}
                  artist={recommended.artist}
                  artistUri={recommended.albumUri}
                  explicit={recommended.explicit}
                />
              );
            })}
          </Tiles>
        </Stack>
      )}
    </>
  );
};

export default Recommended;
