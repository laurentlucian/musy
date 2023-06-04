import type { ReactNode } from 'react';

import type { StackProps } from '@chakra-ui/react';
import { Flex } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';
import { HStack, Heading } from '@chakra-ui/react';

import { useMouseScroll } from '~/hooks/useMouseScroll';
import type { TrackWithInfo } from '~/lib/types/types';

import { useFullscreen } from '../fullscreen/Fullscreen';
import FullscreenTracks from '../fullscreen/tracks/FullscreenTracks';
import ScrollButtons from './ScrollButtons';

type TilesProps = {
  action?: ReactNode;
  autoScroll?: boolean;
  children: ReactNode;
  scrollButtons?: boolean;
  title?: string;
  tracks?: TrackWithInfo[];
} & StackProps;

const Tiles = ({
  action = null,
  autoScroll,
  children,
  scrollButtons,
  title,
  tracks,
  ...ChakraProps
}: TilesProps) => {
  const { props, scrollRef } = useMouseScroll('reverse', autoScroll);
  const { onOpen } = useFullscreen();

  return (
    <>
      <Flex align="center" minH="35px">
        {title && (
          <Text
            fontSize="11px"
            onClick={() => {
              if (title && tracks) {
                onOpen(<FullscreenTracks title={title} tracks={tracks} />);
              }
            }}
            cursor={tracks ? 'pointer' : undefined}
            fontWeight="bolder"
          >
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
