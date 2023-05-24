import { Box, Stack, Text } from '@chakra-ui/react';

import { useTypedLoaderData } from 'remix-typedjson';

import type { loader } from '~/routes/explore/index';

import Tile from '../profile/tiles/tile/Tile';
import TileImage from '../profile/tiles/tile/TileImage';
import TileInfoTop from '../profile/tiles/tile/TileInfoTop';

const Top = () => {
  const { top } = useTypedLoaderData<typeof loader>();
  const layoutKey = 'ExploreTop';
  return (
    <>
      <Text fontSize="15px">Top of the week</Text>
      <Stack spacing="10px">
        {top.map((track, index) => {
          return (
            <Box key={track.id} bg="musy.700" p="10px">
              <Tile
                track={track}
                tracks={top}
                index={index}
                layoutKey={layoutKey}
                image={<TileImage size={'120px'} />}
                info={<TileInfoTop />}
                list
              />
            </Box>
          );
        })}
      </Stack>
    </>
  );
};

export default Top;
