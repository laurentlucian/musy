import type { ReactNode } from 'react';

import type { StackProps } from '@chakra-ui/react';
import { Flex } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';
import { HStack, Heading } from '@chakra-ui/react';

import { useMouseScroll } from '~/hooks/useMouseScroll';
import { useSetExpandedStack } from '~/hooks/useOverlay';

import ScrollButtons from './ScrollButtons';

type TilesProps = {
  action?: ReactNode;
  autoScroll?: boolean;
  children: ReactNode;
  scrollButtons?: boolean;
  setShow?: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
} & StackProps;

const Tiles = ({
  action = null,
  autoScroll,
  children,
  scrollButtons,
  setShow,
  title,
  ...ChakraProps
}: TilesProps) => {
  const { props, scrollRef } = useMouseScroll('reverse', autoScroll);
  const { addToStack } = useSetExpandedStack();
  const onClick = () => {
    if (setShow) {
      setShow(true);
      addToStack(0);
    }
  };

  return (
    <>
      <Flex align="center" minH="35px">
        {title && (
          <Text fontSize="11px" onClick={onClick} cursor="pointer" fontWeight="bolder">
            {title}
          </Text>
        )}

        {action}
        {scrollButtons && <ScrollButtons scrollRef={scrollRef} />}
      </Flex>
      <HStack
        ref={scrollRef}
        className="scrollbar"
        overflow="auto"
        align="flex-start"
        {...props}
        {...ChakraProps}
      >
        {children}
      </HStack>
    </>
  );
};

export default Tiles;
