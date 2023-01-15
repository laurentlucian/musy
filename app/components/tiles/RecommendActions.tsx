import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Image,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import { useRef } from 'react';
import useIsMobile from '~/hooks/useIsMobile';

const RecommendActions = ({ recommendedBy }: { recommendedBy?: Profile }) => {
  const isSmallScreen = useIsMobile();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const btnRef = useRef<any>(null);
//
  return (
    <>
      <Image
        borderRadius="full"
        src={recommendedBy?.image}
        boxSize="40px"
        mr="5px"
        onClick={onOpen}
        ref={btnRef}
      />
      <Drawer
        isOpen={isOpen}
        placement="bottom"
        onClose={onClose}
        finalFocusRef={btnRef}
        lockFocusAcrossFrames
        preserveScrollBarGap
        size="full"
        variant={isSmallScreen ? 'none' : 'desktop'}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody>
            <Stack direction={['column', 'row']} align="center" justify="center">
              <Image borderRadius="full" src={recommendedBy?.image} boxSize="100px" />
              <Stack>
                <Text>{recommendedBy?.name}</Text>
                {/* <Text>{}</Text> */}
              </Stack>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default RecommendActions;
