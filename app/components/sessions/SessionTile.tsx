import { forwardRef } from 'react';

import { Flex, Image } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';

import type { Track } from '~/lib/types/types';
import { timeSince } from '~/lib/utils';

import { useFullscreen } from '../fullscreen/Fullscreen';
import FullscreenTrack from '../fullscreen/track/FullscreenTrack';
import Tooltip from '../Tooltip';

type TileProps = {
  index: number;
  layoutKey: string;
  playedAt?: Date;
  track: Track;
  tracks: Track[];
  userId: string;
} & ChakraProps;

const SessionTile = forwardRef<HTMLDivElement, TileProps>(
  ({ playedAt, track, userId, ...props }, ref) => {
    const image = track.image;
    const tooltip = playedAt ? `${track.name} by ${track.artist} ${timeSince(playedAt)}` : '';
    const { onOpen } = useFullscreen();

    return (
      <Flex direction="row" ref={ref} {...props}>
        <Tooltip label={tooltip} placement="top-start">
          <Image
            boxSize={'50px'}
            minW={'50px'}
            minH={'50px'}
            objectFit="cover"
            src={image}
            draggable={false}
            onClick={() => onOpen(<FullscreenTrack track={track} originUserId={userId} />)}
            cursor="pointer"
          />
        </Tooltip>
      </Flex>
    );
  },
);

SessionTile.displayName = 'SessionT';

export default SessionTile;
