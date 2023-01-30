import { type ReactNode, useRef } from 'react';

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
} from '@chakra-ui/react';

import useDrawerBackButton from '~/hooks/useDrawerBackButton';
import useIsMobile from '~/hooks/useIsMobile';
import { useMouseScroll } from '~/hooks/useMouseScroll';

type TilesProps = {
  Filter?: ReactNode;
  autoScroll?: boolean;
  children: ReactNode;
  onClose: () => void;
  scrollButtons?: boolean;
  show: boolean;
  title?: string;
} & StackProps;

const ExpandedSongs = ({
  Filter = null,
  autoScroll,
  children,
  onClose,
  scrollButtons,
  show,
  title,
  ...ChakraProps
}: TilesProps) => {
  const { props, scrollRef } = useMouseScroll('reverse', autoScroll);
  const btnRef = useRef<HTMLButtonElement>(null);
  const isSmallScreen = useIsMobile();

  useDrawerBackButton(onClose, show);

  return (
    <>
      <Drawer
        size="full"
        isOpen={show}
        onClose={onClose}
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
              {Filter}
            </Stack>
          </DrawerHeader>

          <DrawerBody alignSelf="center" ref={scrollRef} {...props}>
            {children}
          </DrawerBody>
          <Button variant="drawer" color="white" onClick={onClose}>
            close
          </Button>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ExpandedSongs;
