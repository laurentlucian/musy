import type { ReactNode } from 'react';

import type { StackProps } from '@chakra-ui/react';
import { Stack, Flex, Text, HStack } from '@chakra-ui/react';

import { useMouseScroll } from '~/hooks/useMouseScroll';
import type { TrackWithInfo } from '~/lib/types/types';

import { useFullscreen } from '../fullscreen/Fullscreen';
import FullscreenTracks from '../fullscreen/tracks/FullscreenTracks';
import ScrollButtons from './shared/ScrollButtons';

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
    <Stack>
      {(title || scrollButtons || action) && (
        <Flex align="center">
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
      )}
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
    </Stack>
  );
};

export default Tiles;
