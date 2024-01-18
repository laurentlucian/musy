import { useState } from 'react';

import { useEventListener } from 'ahooks';
import { createWithEqualityFn } from 'zustand/traditional';

type FullscreenState = {
  actions: {
    onClose: () => void;
    onOpen: (component: JSX.Element) => void;
  };
  components: JSX.Element[];
};

const useFullscreenStore = createWithEqualityFn<FullscreenState>((set) => ({
  actions: {
    onClose: () => set((prev) => ({ components: prev.components.slice(0, -1) })),
    onOpen: (component: JSX.Element) =>
      set((prev) => ({ components: [...prev.components, component] })),
  },
  components: [],
}));

export const useFullscreen = () => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isMouseDragged, setIsMouseDragged] = useState(false);
  const { components } = useFullscreenStore();
  const { onClose, onOpen } = useFullscreenStore((state) => state.actions);

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
    <div
      className='fixed inset-0 z-50 flex flex-col items-center bg-[#10101066] backdrop-blur-[27px]'
      onClick={(e) => {
        // close fullscreen when clicking outside of the component (on the blur)
        let target = e.target as HTMLElement;
        let isAnchorTag = false;
        let shouldClose = true;

        while (target !== e.currentTarget) {
          if (target instanceof HTMLAnchorElement) {
            isAnchorTag = true;
          }

          const dontClose =
            target instanceof HTMLAnchorElement ||
            target instanceof HTMLButtonElement ||
            target instanceof HTMLImageElement ||
            target.id === 'dont-close';

          if (dontClose) {
            shouldClose = !dontClose;
          }

          target = target.parentNode as HTMLElement;
        }

        if (shouldClose || isAnchorTag) {
          onClose();
        }
      }}
    >
      <div className='flex w-full flex-grow overflow-hidden sm:w-[450px] md:w-[750px] xl:w-[1100px]'>
        {component}
      </div>
      <CloseButton />
    </div>
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
    <button
      id='dont-close'
      className='z-10 h-20 w-full flex-shrink-0 text-musy-200 hover:text-white hover:backdrop-blur-sm md:h-40 lg:h-64'
      onClick={onClose}
    >
      Close
    </button>
  );
};
