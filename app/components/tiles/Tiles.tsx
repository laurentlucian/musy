import type { ReactNode } from 'react';
import type { StackProps } from '@chakra-ui/react';
import { HStack, Heading } from '@chakra-ui/react';
import { useHorizontalScroll } from '~/hooks/useHorizontalScroll';
import ScrollButtons from './ScrollButtons';

type TilesProps = {
  title?: string;
  children: ReactNode;
  autoScroll?: boolean;
  Filter?: ReactNode;
  scrollButtons?: boolean;
  setShow?: React.Dispatch<React.SetStateAction<boolean>>;
} & StackProps;

const Tiles = ({
  title,
  children,
  autoScroll,
  Filter = null,
  scrollButtons,
  setShow,
  ...ChakraProps
}: TilesProps) => {
  const { scrollRef, props } = useHorizontalScroll('reverse', autoScroll);
  const onClick = () => {
    if (setShow) setShow(true);
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
