import { Flex, Image, Link, Stack, Text } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import explicitImage from '~/assets/explicit-solid.svg';
import { useDrawerLayoutKey } from '~/hooks/useDrawer';
import type { Track } from '~/lib/types/types';

const ActionTrack = ({ track }: { track: Track }) => {
  const layoutKey = useDrawerLayoutKey();
  return (
    <Stack
      as={motion.div}
      layoutId={track.id + layoutKey}
      w={['93%', '369px', 500]}
      alignSelf="end"
    >
      <Image
        boxSize={['93%', '369px', 500]}
        minW={['93%', '369px', 500]}
        minH={['93%', '369px', 500]}
        objectFit="cover"
        src={track.image}
        draggable={false}
        cursor="pointer"
        zIndex={999}
      />
      <Link href={track.uri} _hover={{ textDecor: 'none' }} _focus={{ boxShadow: 'none' }}>
        <Text
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
        href={track.artistUri}
        _hover={{ textDecor: 'none' }}
        w="fit-content"
        _focus={{ boxShadow: 'none' }}
        pos="relative"
      >
        <Flex dir="row">
          {track.explicit && <Image src={explicitImage} w="19px" mr="3px" />}
          <Text color="#BBB8B7">{track.artist}</Text>
        </Flex>
      </Link>
    </Stack>
  );
};

export default ActionTrack;
