import { Flex, Image, Link, Stack, Text } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import explicitImage from '~/assets/explicit-solid.svg';
import { useDrawerLayoutKey } from '~/hooks/useDrawer';
import type { Track } from '~/lib/types/types';

const ActionTrack = ({ track }: { track: Track }) => {
  const layoutKey = useDrawerLayoutKey();
  return (
    <Stack as={motion.div} layoutId={track.id + layoutKey} w={['350px', '369px', 500]}>
      <Image
        as={motion.img}
        boxSize={['350px', '369px', 500]}
        minW={['350px', '369px', 500]}
        minH={['350px', '369px', 500]}
        objectFit="cover"
        src={track.image}
        draggable={false}
        cursor="pointer"
        zIndex={999}
      />
      <Link
        as={motion.a}
        href={track.uri}
        _hover={{ textDecor: 'none' }}
        _focus={{ boxShadow: 'none' }}
      >
        <Text
          as={motion.p}
          fontSize={['xl', '5xl']}
          fontWeight="bold"
          textAlign="left"
          w="fit-content"
          wordBreak="break-word"
          pos="relative"
        >
          {track.name}
        </Text>
      </Link>
      <Link
        as={motion.a}
        href={track.artistUri}
        _hover={{ textDecor: 'none' }}
        w="fit-content"
        _focus={{ boxShadow: 'none' }}
        pos="relative"
      >
        <Flex as={motion.div} dir="row">
          {track.explicit && <Image src={explicitImage} w="19px" mr="3px" />}
          <Text color="#BBB8B7">{track.artist}</Text>
        </Flex>
      </Link>
    </Stack>
  );
};

export default ActionTrack;
