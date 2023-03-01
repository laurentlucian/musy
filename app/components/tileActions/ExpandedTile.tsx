// import { useMatches } from '@remix-run/react';
import { useEffect, useState } from 'react';

import { Box, Flex, SimpleGrid } from '@chakra-ui/react';

import { AnimatePresence, motion } from 'framer-motion';

import { useDrawerTrack } from '~/hooks/useDrawer';
// import useParentData from '~/hooks/useParentData';

import CloseButton from './actions/CloseButton';
import { default as Track } from './ActionTrack';
import { default as Actions } from './TileActions';

const ExpandedTile = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const track = useDrawerTrack();
  // const test = useParentData('/daniel.valdecantos/');
  // console.log(useMatches());
  // console.log(track)
  useEffect(() => {
    if (track) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [track]);

  return (
    <AnimatePresence initial={false} custom={direction}>
      {track && (
        <Box
          as={motion.div}
          zIndex={9}
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
          <Flex
            pos={['unset', 'relative']}
            left="25%"
            top={['100', '200']}
            w={{ base: '100vw', md: '750px', sm: '450px', xl: '1100px' }}
            h={['100%', 'unset']}
            direction={['column', 'row']}
            justifyContent={['space-between', 'unset']}
          >
            <SimpleGrid columns={[1, 2]} justifyItems="end" w="100%" h="100%" overflow="hidden">
              <Track
                track={track}
                page={page}
                direction={direction}
                setPage={setPage}
              />
              <Actions track={track} />
            </SimpleGrid>
            <CloseButton />
          </Flex>
        </Box>
      )}
    </AnimatePresence>
  );
};

export default ExpandedTile;
