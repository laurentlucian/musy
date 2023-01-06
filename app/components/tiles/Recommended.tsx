import { Stack } from '@chakra-ui/react';
import type { RecommendedSongs } from '@prisma/client';
import Tile from '../Tile';
import Tiles from './Tiles';

const Recommended = ({ recommended }: { recommended: RecommendedSongs[] }) => {
  const scrollButtons = recommended.length > 5;
  const show = recommended.length > 0;

  return (
    <>
      {show && (
        <Stack spacing={3}>
          <Tiles title="Recommended" scrollButtons={scrollButtons}>
            {recommended.map((recommended) => {
              return (
                <>
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
                    recommend={show}
                  />
                </>
              );
            })}
          </Tiles>
        </Stack>
      )}
    </>
  );
};

export default Recommended;
