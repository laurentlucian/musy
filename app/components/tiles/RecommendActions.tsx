import { useParams } from '@remix-run/react';
import { useRef } from 'react';

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Image,
  Stack,
  Text,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';

import { Archive, Minus } from 'iconsax-react';
import { useTypedFetcher } from 'remix-typedjson';

import useIsMobile from '~/hooks/useIsMobile';
import { BarChart, MoreHorizontal } from 'react-feather';
import type { action } from '~/routes/$id/removeRecommend';

const RecommendActions = ({
  // recommendedByName,
  // recommendedByImage,
  trackId,
  onToggle,
}: {
  // recommendedByName?: string;
  // recommendedByImage?: string;
  trackId: string;
  onToggle: () => void;
}) => {
  const isSmallScreen = useIsMobile();
  const { id } = useParams();
  const fetcher = useTypedFetcher<typeof action>();
  // const { isOpen, onClose, onOpen } = useDisclosure();
  const btnRef = useRef<any>(null);

  const archiveRecommend = () => {
    const action = `/${id}/removeRecommend`;
    fetcher.submit({ trackId }, { action, method: 'post', replace: true });
  };
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.700');
  // const Mobile = (
  //   <>
  //     <IconButton
  //       p={0}
  //       variant="ghost"
  //       aria-label="open options"
  //       _hover={{ color: 'spotify.green' }}
  //       icon={<MoreHorizontal />}
  //       onClick={onOpen}
  //       ref={btnRef}
  //       h="10px"
  //       alignSelf="center"
  //     />
  //     <Drawer
  //       isOpen={isOpen}
  //       placement="bottom"
  //       onClose={onClose}
  //       finalFocusRef={btnRef}
  //       lockFocusAcrossFrames
  //       preserveScrollBarGap
  //       size="full"
  //       variant={isSmallScreen ? 'none' : 'desktop'}
  //     >
  //       <DrawerOverlay />
  //       <DrawerContent>
  //         <DrawerBody>
  //           <Stack direction={['column', 'row']} align="center" justify="center">
  //             <Image borderRadius="full" src={recommendedByImage} boxSize="100px" />
  //             <Button onClick={archiveRecommend} variant="ghost" _hover={{ color: 'red' }}>
  //               <Minus size="32" />
  //             </Button>
  //             <Stack>
  //               <Text>{recommendedByName}</Text>
  //             </Stack>
  //           </Stack>
  //         </DrawerBody>
  //       </DrawerContent>
  //     </Drawer>
  //   </>
  // );

  const Desktop = (
    <Menu placement="bottom-end">
      <MenuButton
        as={IconButton}
        aria-label="open options"
        rightIcon={<MoreHorizontal />}
        _hover={{ color: 'spotify.green' }}
        _active={{ bg: '#0000' }}
        h="10px"
        alignSelf="center"
        bg="#0000"
        color={color}
      />
      <MenuList bg={bg}>
        <MenuItem icon={<BarChart />} onClick={onToggle} bg="#0000" color={color}>
          rate recommendation
        </MenuItem>
        <MenuItem icon={<Archive />} onClick={archiveRecommend} bg="#0000" color={color}>
          archive recommendation
        </MenuItem>
      </MenuList>
    </Menu>
  );
  return isSmallScreen ? Desktop : Desktop;
};

export default RecommendActions;
