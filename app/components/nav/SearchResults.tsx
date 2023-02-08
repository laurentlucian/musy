import type { ReactNode } from 'react';

import type { StackProps } from '@chakra-ui/react';
import { HStack } from '@chakra-ui/react';

import { useMouseScroll } from '~/hooks/useMouseScroll';

interface ResultsConfig extends StackProps {
  children: ReactNode;
}

const SearchResults = ({ children, ...ChakraProps }: ResultsConfig) => {
  const { props, scrollRef } = useMouseScroll('reverse', false);

  return (
    <HStack
      ref={scrollRef}
      className="scrollbar"
      overflow="scroll"
      align="flex-start"
      pb={2}
      {...props}
      {...ChakraProps}
      pos="fixed"
      top="25%"
      // right="50%"
      bg="black"
    >
      {children}
    </HStack>
  );
};

export default SearchResults;
