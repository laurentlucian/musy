import { HStack, Text } from '@chakra-ui/react';

import { useTypedLoaderData } from 'remix-typedjson';

import type { loader } from '~/routes/explore/index';

import Tile from '../profile/tiles/tile/Tile';
import TileImage from '../profile/tiles/tile/TileImage';
import TileInfo from '../profile/tiles/tile/TileInfo';

const Top = () => {
  const { top } = useTypedLoaderData<typeof loader>();
  const layoutKey = 'ExploreTop';
  return (
    <>
      <HStack align="center" mt="15px">
        <Text>Top</Text>
        <Text fontSize={['9px', '10px']} opacity={0.6} pt="2px">
          7d
        </Text>
      </HStack>
      {top.map((track, index) => {
        return (
          <Tile
            key={track.id}
            track={track}
            tracks={top}
            index={index}
            layoutKey={layoutKey}
            image={<TileImage size={'40px'} />}
            info={<TileInfo />}
            list
          />
        );
      })}
    </>
  );
};

export default Top;
