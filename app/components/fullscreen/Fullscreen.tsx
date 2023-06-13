import { useState } from 'react';

import { Button, Flex, useEventListener } from '@chakra-ui/react';

import { create } from 'zustand';

const useFullscreenStore = create<{
  components: JSX.Element[];
}>(() => ({
  components: [],
}));

const setFullscreenState = useFullscreenStore.setState;

export const useFullscreen = () => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isMouseDragged, setIsMouseDragged] = useState(false);
  const { components } = useFullscreenStore();

  const onOpen = (component: JSX.Element) => {
    setFullscreenState((prev) => ({ components: [...prev.components, component] }));
  };

  const onClose = () => {
    setFullscreenState((prev) => ({ components: prev.components.slice(0, -1) }));
  };

  const handleMouseDown = () => {
    setIsMouseDown(true);
  };

  const handleMouseMove = () => {
    if (isMouseDown) {
      setIsMouseDragged(true);
    }
  };

  const handleClick = (component: JSX.Element) => {
    if (!isMouseDragged) {
      onOpen(component);
    }
    setIsMouseDown(false);
    setIsMouseDragged(false);
  };

  return {
    components,
    onClick: handleClick,
    onClose,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onOpen,
  };
};

export const FullscreenRenderer = () => {
  const { components, onClose } = useFullscreen();
  const component = components[components.length - 1];

  if (!component) return null;

  return (
    <Flex
      zIndex={9}
      bg="#10101066"
      backdropFilter="blur(27px)"
      direction="column"
      onClick={(e) => {
        // close fullscreen when clicking outside of the component (on the blur)
        let target = e.target as HTMLElement;
        let isAnchorTag = false;
        let shouldClose = true;

        while (target !== e.currentTarget) {
          if (target instanceof HTMLAnchorElement) {
            isAnchorTag = true;
          }

          shouldClose =
            target instanceof HTMLAnchorElement ||
            target instanceof HTMLButtonElement ||
            target instanceof HTMLImageElement ||
            target.id === 'dont-close';

          target = target.parentNode as HTMLElement;
        }

        if (shouldClose || isAnchorTag) {
          onClose();
        }
      }}
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
        {component}
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
