import { Box, Button, HStack } from '@chakra-ui/react';

import { AnimatePresence, motion } from 'framer-motion';

import { useDrawerActions, useDrawerTrack } from '~/hooks/useDrawer';

import { default as Track } from './ActionTrack';
import { default as Actions } from './TileActions';

const ExpandedTile = () => {
  const track = useDrawerTrack();
  const { onClose } = useDrawerActions();
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
          <HStack>
            <Track track={track} />
            <Actions track={track} />
          </HStack>
          <Button onClick={onClose}>close</Button>
        </Box>
      )}
    </AnimatePresence>
  );
};

export default ExpandedTile;
