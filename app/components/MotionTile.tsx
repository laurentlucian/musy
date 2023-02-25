import { forwardRef } from 'react';

import { Flex, Image, Text } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import explicitImage from '~/assets/explicit-solid.svg';
import { useDrawerActions } from '~/hooks/useDrawer';
import type { Track } from '~/lib/types/types';

const TileMotion = forwardRef<
  HTMLDivElement,
  { layoutKey: string; profileId: string; track: Track }
>(({ layoutKey, profileId, track }, ref) => {
  const { onClose, onOpen } = useDrawerActions();
  return (
    <motion.div
      ref={ref}
      onClick={() => {
        if (track) {
          onOpen(track, profileId, layoutKey);
        } else {
          onClose();
        }
      }}
      layoutId={track.id + layoutKey}
    >
      <Image
        // as={motion.img}
        boxSize="200px"
        minW="200px"
        minH="200px"
        objectFit="cover"
        src={track.image}
        draggable={false}
        cursor="pointer"
      />
      <Text
        // as={motion.p}
        fontSize="13px"
        noOfLines={3}
        whiteSpace="normal"
        wordBreak="break-word"
        mt="5px"
      >
        {track.name}
      </Text>
      <Flex as={motion.div} dir="row">
        {track.explicit && <Image src={explicitImage} w="19px" mr="3px" />}
        <Text fontSize="11px" opacity={0.8} noOfLines={2}>
          {track.artist}
        </Text>
      </Flex>
    </motion.div>
  );
});

TileMotion.displayName = 'Motion Tile';

export const MotionTile = motion(TileMotion);
