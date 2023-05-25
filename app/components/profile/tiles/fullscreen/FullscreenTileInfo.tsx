import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

import { Box, Flex, HStack, Image, Link, Stack, Text, useEventListener } from '@chakra-ui/react';

import { motion, wrap } from 'framer-motion';

import LikedBy from '~/components/home/activity/LikedBy';
import PlayedBy from '~/components/home/activity/PlayedBy';
import { useFullscreenTileIndex, useFullscreenTiles } from '~/hooks/useFullscreenTileStore';
import useIsMobile from '~/hooks/useIsMobile';
import explicitImage from '~/lib/assets/explicit-solid.svg';

type ActionTrackProps = {
  direction: number;
  page: number;
  setPage: Dispatch<SetStateAction<[number, number]>>;
};

const variants = {
  center: {
    opacity: 1,
    x: 0,
    zIndex: 1,
  },
  enter: (direction: number) => {
    return {
      opacity: 0,
      x: direction > 0 ? 1000 : -1000,
    };
  },
  exit: (direction: number) => {
    return {
      opacity: 0,
      x: direction < 0 ? 1000 : -1000,
      zIndex: 0,
    };
  },
};

const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const FullscreenInfo = ({ direction, page, setPage }: ActionTrackProps) => {
  const [dragging, setDragging] = useState(false);
  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };
  const isSmallScreen = useIsMobile();
  const originalIndex = useFullscreenTileIndex();
  // const layoutKey = useFullscreenLayoutKey();
  const tracks = useFullscreenTiles();
  const index = wrap(0, tracks.length, page + originalIndex);
  const track = tracks[index];

  useEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') paginate(1);
    if (e.code === 'ArrowLeft') paginate(-1);
  });

  return (
    <motion.div
      key={page}
      custom={direction}
      variants={variants}
      initial={dragging ? 'enter' : false}
      animate="center"
      exit={dragging ? 'exit' : 'unset'}
      transition={{
        opacity: { duration: 0.2 },
        x: { damping: 30, stiffness: 300, type: 'spring' },
      }}
      style={{ touchAction: 'none' }}
      drag={tracks.length > 1 ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={(e, { offset, velocity }) => {
        const swipe = swipePower(offset.x, velocity.x);
        if (swipe < -10000) {
          paginate(1);
        } else if (swipe > 10000) {
          paginate(-1);
        }
      }}
      onPanEnd={() => {
        setDragging(false);
      }}
    >
      <Stack
        align={['center', 'start']}
        mt={['50px', '0px']}
        mx="auto"
        onPointerDown={() => setDragging(true)}
      >
        <Stack w="65%" spacing={['10px']}>
          {/* <motion.div layoutId={tracks[originalIndex].id + layoutKey}> */}
          <Image objectFit="cover" src={track.image} draggable={false} zIndex={10} />
          {/* </motion.div> */}
          <HStack mt={['5px', '15px']}>
            {track.liked?.length && <LikedBy liked={track.liked} />}
            {track.recent?.length && <PlayedBy played={track.recent} />}
          </HStack>
        </Stack>

        <Flex direction="column" flex={1} align={['center', 'start']}>
          <Link href={track.uri} _hover={{ textDecor: 'none' }} _focus={{ boxShadow: 'none' }}>
            <Text
              fontSize={['xl', '3xl']}
              fontWeight="bold"
              textAlign={['center', 'left']}
              w="fit-content"
              wordBreak="break-word"
              pos="relative"
            >
              {track.name}
            </Text>
          </Link>
          <Stack direction={['row', 'column']} align={['center', 'start']}>
            <Flex align="center">
              {track.explicit && <Image src={explicitImage} w="15px" mr="3px" />}
              <Link
                href={track.artistUri}
                _hover={{ textDecor: 'none' }}
                w="fit-content"
                _focus={{ boxShadow: 'none' }}
                pos="relative"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Text color="#BBB8B7" fontSize={['11px', '13px']}>
                  {track.artist}
                </Text>
              </Link>
            </Flex>
            {isSmallScreen && <Box opacity={0.6}>•</Box>}
            <Link
              href={track.albumUri}
              _hover={{ textDecor: 'none' }}
              w="fit-content"
              _focus={{ boxShadow: 'none' }}
              pos="relative"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Text color="#BBB8B7" fontSize={['11px', '13px']}>
                {track.albumName}
              </Text>
            </Link>
          </Stack>
        </Flex>
      </Stack>
    </motion.div>
  );
};

export default FullscreenInfo;
