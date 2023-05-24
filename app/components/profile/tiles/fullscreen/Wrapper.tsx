import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { type ReactNode, useEffect, createContext, useContext } from 'react';

import { Box, Flex } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import { useFullscreenTileStore } from '~/hooks/useFullscreenTileStore';

type ViewsTypes = 'default' | 'queue' | 'comment';

export const FullscreenTileViewContext = createContext<{
  setView: Dispatch<SetStateAction<ViewsTypes>>;
  view: ViewsTypes;
}>({
  setView: () => null,
  view: 'default',
});

export const useFullscreenTileView = () => {
  const context = useContext(FullscreenTileViewContext);
  if (!context) {
    throw new Error('Views.* component must be rendered as a child of FullscreenTile component');
  }
  return context;
};

const Wrapper = ({ children }: { children: ReactNode }) => {
  const [view, setView] = useState<ViewsTypes>('default');
  const track = useFullscreenTileStore();

  useEffect(() => {
    if (track) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [track]);

  return (
    track && (
      <FullscreenTileViewContext.Provider value={{ setView, view }}>
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
      </FullscreenTileViewContext.Provider>
    )
  );
};

export default Wrapper;
