import { HStack, Text } from '@chakra-ui/react';

import type { Track } from '@prisma/client';
import { useTypedLoaderData } from 'remix-typedjson';

import useSessionUser from '~/hooks/useSessionUser';
import type { loader } from '~/routes/explore';

import Tile from '../Tile';

const Top = ({ tracks }: { tracks: Track[] }) => {
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
          layoutKey={'ExploreTop' + index}
          track={track}
          tracks={tracks}
          index={index}
          profileId={id}
          list
        />
      ))}
    </>
  );
};

export default Top;
