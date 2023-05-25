import { Box, Stack, Text } from '@chakra-ui/react';

import { useTypedLoaderData } from 'remix-typedjson';

import type { loader } from '~/routes/explore/index';

import LikedBy from '../home/activity/LikedBy';
import PlayedBy from '../home/activity/PlayedBy';
import Tile from '../profile/tiles/tile/Tile';
import TileImage from '../profile/tiles/tile/TileImage';
import TileInfo from '../profile/tiles/tile/TileInfo';

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
                info={
                  <TileInfo>
                    <Stack spacing={1}>
                      {track.liked?.length && <LikedBy liked={track.liked} />}
                      {track.recent?.length && <PlayedBy played={track.recent} />}
                    </Stack>
                  </TileInfo>
                }
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
