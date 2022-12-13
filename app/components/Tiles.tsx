import { HStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useHorizontalScroll } from '~/hooks/useHorizontalScroll';

type TilesProps = {
  children: ReactNode;
  autoScroll?: boolean;
};

const Tiles = ({ children, autoScroll }: TilesProps) => {
  const { scrollRef, props } = useHorizontalScroll('reverse', autoScroll);

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
