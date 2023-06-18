import type { ReactNode } from 'react';
import { forwardRef } from 'react';

import { Flex, Stack } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';

import { motion } from 'framer-motion';

type TileProps = {
  image?: ReactNode;
  info?: ReactNode;
} & ChakraProps;

const Tile = forwardRef<HTMLDivElement, TileProps>(({ image, info, ...props }, ref) => {
  return (
    <Stack as={motion.div} ref={ref} {...props}>
      {image}
      <Flex justify="space-between">{info}</Flex>
    </Stack>
  );
});

Tile.displayName = 'Tile';

export default Tile;
