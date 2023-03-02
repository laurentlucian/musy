import { forwardRef } from 'react';

import { Flex, Image } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';

import { useClickDrag } from '~/hooks/useDrawer';
import type { Track } from '~/lib/types/types';
import { timeSince } from '~/lib/utils';

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
  ({ index, layoutKey, playedAt, track, tracks, userId, ...props }, ref) => {
    const image = track.image;
    const tooltip = playedAt ? `${track.name} by ${track.artist} ${timeSince(playedAt)}` : '';

    const { onClick, onMouseDown, onMouseMove } = useClickDrag();

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
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onClick={() => onClick(track, userId, layoutKey, tracks, index)}
            cursor="pointer"
          />
        </Tooltip>
      </Flex>
    );
  },
);

SessionTile.displayName = 'SessionT';

export default SessionTile;
