import type { ReactNode } from 'react';

import type { StackProps } from '@chakra-ui/react';
import { HStack, Heading } from '@chakra-ui/react';

import { useMouseScroll } from '~/hooks/useMouseScroll';
import { useSetExpandedStack } from '~/hooks/useOverlay';

import ScrollButtons from './ScrollButtons';

type TilesProps = {
  Filter?: ReactNode;
  autoScroll?: boolean;
  children: ReactNode;
  scrollButtons?: boolean;
  setShow?: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
} & StackProps;

const Tiles = ({
  Filter = null,
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
      <HStack spacing={5} align="center">
        {title && (
          <Heading fontSize={['xs', 'sm']} onClick={onClick} cursor="pointer">
            {title}
          </Heading>
        )}

        {Filter}

        {scrollButtons && <ScrollButtons scrollRef={scrollRef} />}
      </HStack>
      <HStack
        ref={scrollRef}
        className="scrollbar"
        overflow="auto"
        align="flex-start"
        pb={2}
        {...props}
        {...ChakraProps}
      >
        {children}
      </HStack>
    </>
  );
};

export default Tiles;
