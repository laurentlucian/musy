import type { ReactNode } from 'react';
import { forwardRef } from 'react';

import { Flex, Stack } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import useIsMobile from '~/hooks/useIsMobile';

import SpotifyLogo from './icons/SpotifyLogo';

type TileProps = {
  action?: ReactNode;
  image?: ReactNode;
  info?: ReactNode;
  list?: boolean;
} & ChakraProps;

const Tile = forwardRef<HTMLDivElement, TileProps>(
  ({ action, image, info, list, ...props }, ref) => {
    const isSmallScreen = useIsMobile();

    return (
      <>
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
      </>
    );
  },
);

Tile.displayName = 'Tile';

export default Tile;
