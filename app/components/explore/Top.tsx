import { HStack, Text } from '@chakra-ui/react';

import { useTypedLoaderData } from 'remix-typedjson';

import useSessionUser from '~/hooks/useSessionUser';
import type { loader } from '~/routes/explore/index';

import Tile from '../Tile';
import TileImage from '../TileImage';
import TileInfo from '../TileInfo';

const Top = () => {
  const currentUser = useSessionUser();
  const id = currentUser?.userId;
  const { top } = useTypedLoaderData<typeof loader>();

  return (
    <>
      <HStack align="center">
        <Text>Top</Text>
        <Text fontSize={['9px', '10px']} opacity={0.6} pt="2px">
          7d
        </Text>
      </HStack>
      {top.map((track, index) => (
        <Tile
          key={track.id}
          layoutKey="ExploreTop"
          track={track}
          list
          image={
            <TileImage
              src={track.image}
              index={index}
              layoutKey="ExploreTop"
              track={track}
              tracks={top}
              profileId={id}
              size={'40px'}
            />
          }
          info={
            <TileInfo
              index={index}
              layoutKey="ExploreTop"
              track={track}
              tracks={top}
              profileId={id}
            />
          }
        />
      ))}
    </>
  );
};

export default Top;
