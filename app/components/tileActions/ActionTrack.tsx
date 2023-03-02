import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

import { Flex, Image, Link, Stack, Text } from '@chakra-ui/react';

import { motion, wrap } from 'framer-motion';

import explicitImage from '~/assets/explicit-solid.svg';
import { useDrawerLayoutKey, useDrawerTrackIndex, useDrawerTracks } from '~/hooks/useDrawer';

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

const ActionTrack = ({ direction, page, setPage }: ActionTrackProps) => {
  const [dragging, setDragging] = useState(false);
  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };
  const originalIndex = useDrawerTrackIndex();
  const layoutKey = useDrawerLayoutKey();
  const tracks = useDrawerTracks();
  const index = wrap(0, tracks.length, page + originalIndex);

  return (
    <Stack
      as={motion.div}
      layoutId={tracks[originalIndex].id + layoutKey}
      w={['93%', '369px', 500]}
      alignSelf="end"
      onPointerDown={() => setDragging(true)}
    >
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
        <Image
          boxSize={['93%', '369px', 500]}
          minW={['93%', '369px', 500]}
          minH={['93%', '369px', 500]}
          objectFit="cover"
          src={tracks[index].image}
          draggable={false}
          cursor="pointer"
          zIndex={10}
        />
        <Link
          href={tracks[index].uri}
          _hover={{ textDecor: 'none' }}
          _focus={{ boxShadow: 'none' }}
        >
          <Text
            fontSize={['xl', '5xl']}
            fontWeight="bold"
            textAlign="left"
            w="fit-content"
            wordBreak="break-word"
            pos="relative"
          >
            {tracks[index].name}
          </Text>
        </Link>
        <Link
          href={tracks[index].artistUri}
          _hover={{ textDecor: 'none' }}
          w="fit-content"
          _focus={{ boxShadow: 'none' }}
          pos="relative"
        >
          <Flex dir="row">
            {tracks[index].explicit && <Image src={explicitImage} w="19px" mr="3px" />}
            <Text color="#BBB8B7">{tracks[index].artist}</Text>
          </Flex>
        </Link>
      </motion.div>
    </Stack>
  );
};

export default ActionTrack;
