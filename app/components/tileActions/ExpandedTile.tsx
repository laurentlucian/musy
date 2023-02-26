import { Box, Stack } from '@chakra-ui/react';

import { AnimatePresence, motion } from 'framer-motion';

import { useDrawerTrack } from '~/hooks/useDrawer';

import CloseButton from './actions/CloseButton';
import { default as Track } from './ActionTrack';
import { default as Actions } from './TileActions';

const ExpandedTile = () => {
  const track = useDrawerTrack();
  return (
    <AnimatePresence>
      {track && (
        <Box
          as={motion.div}
          zIndex={999}
          bg="#10101066"
          backdropFilter="blur(27px)"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          w="100vw"
          h="100vh"
          pos="fixed"
          top={0}
          left={0}
        >
          <Stack
            pos={['unset', 'relative']}
            left="25%"
            top="200"
            w={{ base: '100vw', md: '750px', sm: '450px', xl: '1100px' }}
            direction={['column', 'row']}
          >
            <Track track={track} />
            <Actions track={track} />
            <CloseButton />
          </Stack>
        </Box>
      )}
    </AnimatePresence>
  );
};

export default ExpandedTile;
