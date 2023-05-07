import { type ReactNode, useEffect } from 'react';

import { Box, Flex } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import { useExpandedTile } from '~/hooks/useExpandedTileState';

const Wrapper = ({ children }: { children: ReactNode }) => {
  const track = useExpandedTile();

  useEffect(() => {
    if (track) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [track]);

  return (
    track && (
      <Box
        as={motion.div}
        zIndex={9}
        bg="#10101066"
        backdropFilter="blur(27px)"
        initial={{ opacity: 0.2 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        w="100vw"
        h="100dvh"
        pos="fixed"
        top={0}
        left={0}
      >
        <Flex
          pos={['unset', 'relative']}
          left="25%"
          top={['100', '200']}
          w={{ base: '100vw', md: '750px', sm: '450px', xl: '1100px' }}
          h={['100%', 'unset']}
          direction={['column', 'row']}
          justifyContent={['space-between', 'unset']}
        >
          {children}
        </Flex>
      </Box>
    )
  );
};

export default Wrapper;
