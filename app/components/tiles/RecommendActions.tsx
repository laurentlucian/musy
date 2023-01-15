import {
  Button,
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
import { useParams } from '@remix-run/react';
import { useRef } from 'react';
import { useTypedFetcher } from 'remix-typedjson';
import useIsMobile from '~/hooks/useIsMobile';
import type { action } from '~/routes/$id/removeRecommend';

const RecommendActions = ({
  recommendedBy,
  trackId,
}: {
  recommendedBy?: Profile;
  trackId: string;
}) => {
  const isSmallScreen = useIsMobile();
  const { id } = useParams();
  const fetcher = useTypedFetcher<typeof action>();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const btnRef = useRef<any>(null);
  const removeFromRecommended = () => {
    const action = `/${id}/removeRecommend`;
    fetcher.submit({ trackId }, { replace: true, method: 'post', action });
  };
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
              <Button onClick={removeFromRecommended}>-</Button>
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
