import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { Button, Flex, useEventListener } from '@chakra-ui/react';

import { motion } from 'framer-motion';
import { create } from 'zustand';

const useFullscreenStore = create<{
  components: JSX.Element[];
}>(() => ({
  components: [],
}));

const setFullscreenState = useFullscreenStore.setState;

export const useFullscreen = () => {
  const { components } = useFullscreenStore();

  const onOpen = (component: JSX.Element) => {
    setFullscreenState((prev) => ({ components: [...prev.components, component] }));
  };

  const onClose = () => {
    setFullscreenState((prev) => ({ components: prev.components.slice(0, -1) }));
  };

  return {
    components,
    onClose,
    onOpen,
  };
};

export const FullscreenRenderer = () => {
  const components = useFullscreenStore((state) => state.components);
  const component = components[components.length - 1];

  useEffect(() => {
    if (component) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }
  }, [component]);

  if (!component) return null;

  return <Container>{component}</Container>;
};

const Container = (props: { children: ReactNode }) => {
  return (
    <Flex
      as={motion.div}
      zIndex={9}
      bg="#10101066"
      backdropFilter="blur(27px)"
      initial={{ opacity: 0.2 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      direction="column"
      align="center"
      pos="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
    >
      <Flex
        flexGrow={1}
        w={{ base: '100vw', md: '750px', sm: '450px', xl: '1100px' }}
        overflow="hidden"
      >
        {props.children}
      </Flex>
      <CloseButton />
    </Flex>
  );
};

const CloseButton = () => {
  const { onClose } = useFullscreen();

  useEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      onClose();
    }
  });

  return (
    <Button
      flexShrink={0}
      h={['80px', '150px', '250px']}
      variant="mobileNav"
      w="100%"
      color="musy.200"
      _hover={{ color: 'white' }}
      onClick={onClose}
      zIndex={1}
    >
      Close
    </Button>
  );
};

export default {
  CloseButton,
  Container,
};
