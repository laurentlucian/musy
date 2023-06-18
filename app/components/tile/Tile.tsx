import type { ReactNode } from 'react';
import { forwardRef } from 'react';

import { Flex, Stack } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';

import type { Track } from '@prisma/client';
import { motion } from 'framer-motion';

import TileContext from '~/hooks/useTileContext';
import type { TrackWithInfo } from '~/lib/types/types';

type TileProps = {
  action?: ReactNode;
  image?: ReactNode;
  index: number;
  info?: ReactNode;
  layoutKey: string;
  track: TrackWithInfo;
  tracks: Track[];
} & ChakraProps;

const Tile = forwardRef<HTMLDivElement, TileProps>(
  ({ image, index, info, layoutKey, track, tracks, ...props }, ref) => {
    return (
      <TileContext.Provider value={{ index, layoutKey, track, tracks }}>
        <Stack as={motion.div} ref={ref} {...props}>
          {image}
          <Flex justify="space-between">{info}</Flex>
        </Stack>
      </TileContext.Provider>
    );
  },
);

Tile.displayName = 'Tile';

export default Tile;
