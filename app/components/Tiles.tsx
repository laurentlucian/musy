import { HStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useHorizontalScroll } from '~/hooks/useHorizontalScroll';

const Tiles = ({ children }: { children: ReactNode }) => {
  const { scrollRef, props } = useHorizontalScroll('reverse');

  return (
    <HStack
      ref={scrollRef}
      className="scrollbar"
      overflow="auto"
      align="flex-start"
      pb={2}
      {...props}
    >
      {children}
    </HStack>
  );
};

export default Tiles;
