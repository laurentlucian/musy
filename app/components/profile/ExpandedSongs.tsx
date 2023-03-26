import { type ReactNode, type Dispatch, type SetStateAction, useRef, useEffect } from 'react';

import {
  Stack,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  type StackProps,
  Text,
  IconButton,
} from '@chakra-ui/react';

import { Element3, TextalignJustifycenter } from 'iconsax-react';

import { useDrawerActions, useDrawerTrack } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import { useMouseScroll } from '~/hooks/useMouseScroll';
import { useExpandedStack, useSetExpandedStack } from '~/hooks/useOverlay';

type TilesProps = {
  Filter?: ReactNode;
  autoScroll?: boolean;
  children: ReactNode;
  layout: boolean;
  onClose: () => void;
  setLayout: Dispatch<SetStateAction<boolean>>;
  show: boolean;
  title?: string;
} & StackProps;

const ExpandedSongs = ({
  Filter = null,
  autoScroll,
  children,
  layout,
  onClose,
  setLayout,
  show,
  title,
}: TilesProps) => {
  const { props, scrollRef } = useMouseScroll('reverse', autoScroll);
  const btnRef = useRef<HTMLButtonElement>(null);
  const isSmallScreen = useIsMobile();
  const stack = useExpandedStack();
  const track = useDrawerTrack();
  const isOpen = track !== null ? true : false;
  const { onClose: closeTile } = useDrawerActions();
  const { removeFromStack } = useSetExpandedStack();
  const onCloseTile = () => {
    closeTile();
    removeFromStack(1);
  };

  useEffect(() => {
    if (show && !isOpen && !isSmallScreen) {
      window.history.pushState({ drawer: 'SongsDrawer' }, document.title, window.location.href);

      addEventListener('popstate', onClose);

      return () => removeEventListener('popstate', onClose);
    }
  }, [show, onClose, isOpen, isSmallScreen]);
  return (
    <>
      <Drawer
        size="full"
        isOpen={show}
        onClose={stack?.includes(1) ? onCloseTile : onClose}
        placement="bottom"
        preserveScrollBarGap
        lockFocusAcrossFrames
        finalFocusRef={btnRef}
        variant={isSmallScreen ? 'none' : 'desktop'}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader alignSelf="center">
            <Stack direction="row" align="end">
              <Text pl={title === 'Top' ? '115px' : 0} mr={title === 'Top' ? '20px' : 0}>
                {title}
              </Text>
              <IconButton
                aria-label="switch layouts"
                icon={layout ? <Element3 /> : <TextalignJustifycenter />}
                onClick={() => setLayout(!layout)}
                variant="ghost"
                tabIndex={-1}
              />
              {Filter}
            </Stack>
          </DrawerHeader>

          <DrawerBody alignSelf="center" ref={scrollRef} {...props}>
            {children}
          </DrawerBody>
          <Button
            variant="drawer"
            color="white"
            onClick={() => {
              onClose();
              if (window.history.state === 'SongsDrawer' && !isSmallScreen) {
                window.history.back();
              }
            }}
            h={['20px', '40px']}
            pt="20px"
            pb="40px"
            w="100vw"
          >
            close
          </Button>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ExpandedSongs;
