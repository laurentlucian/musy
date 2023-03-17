import type { ReactNode } from 'react';
import { forwardRef } from 'react';

import { Flex, Stack } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';

import type { Track } from '@prisma/client';
import { motion } from 'framer-motion';

import useIsMobile from '~/hooks/useIsMobile';
import TileContext from '~/hooks/useTileContext';

import SpotifyLogo from './icons/SpotifyLogo';

type TileProps = {
  action?: ReactNode;
  image?: ReactNode;
  index: number;
  info?: ReactNode;
  layoutKey: string;
  list?: boolean;
  track: Track;
  tracks: Track[];
} & ChakraProps;

const Tile = forwardRef<HTMLDivElement, TileProps>(
  ({ action, image, index, info, layoutKey, list, track, tracks, ...props }, ref) => {
    const isSmallScreen = useIsMobile();

    return (
      <TileContext.Provider value={{ index, layoutKey, track, tracks }}>
        <Stack
          as={motion.div}
          ref={ref}
          flex={list ? undefined : '0 0 200px'}
          direction={list ? 'row' : undefined}
          {...props}
          maxW={list ? '40px' : '200px'}
        >
          {image}
          <Flex justify="space-between">
            {info}
            <Stack>{action ? action : <SpotifyLogo icon mx="5px" white={isSmallScreen} />}</Stack>
          </Flex>
        </Stack>
      </TileContext.Provider>
    );
  },
);

Tile.displayName = 'Tile';

export default Tile;
