import type { ReactNode } from 'react';

import { HStack, Flex } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';

import type { Track } from '~/lib/types/types';

import TileTrackInfo from './TileTrackInfo';

type TileTrackListProps = {
  action?: ReactNode;
  image: ReactNode;
  onClick?: () => void;
  track: Track;
} & ChakraProps;

const TileTrackList = ({ action, image, onClick, track }: TileTrackListProps) => {
  return (
    <HStack>
      {image}
      <Flex direction="column" justify="space-between" w="100%" onClick={onClick}>
        <TileTrackInfo track={track} />
        <Flex>{action}</Flex>
      </Flex>
    </HStack>
  );
};

export default TileTrackList;
