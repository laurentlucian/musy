import { HStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useHorizontalScroll } from '~/utils';

const Tiles = ({ children }: { children: ReactNode }) => {
  const { scrollRef, props } = useHorizontalScroll('reverse');

  return (
    <HStack ref={scrollRef} className="scrollbar" overflow="auto" pb={3} align="flex-start" {...props}>
      {children}
    </HStack>
  );
};

export default Tiles;
