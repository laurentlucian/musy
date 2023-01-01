import {
  Button,
  useDisclosure,
  Icon,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Stack,
  Input,
  Text,
} from '@chakra-ui/react';
import { HeartAdd, ArrowDown2, ArrowRight2 } from 'iconsax-react';
import { useRef } from 'react';

const SaveTo = () => {
  const selectMenu = useDisclosure();
  const playlists = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  const SaveSongTo = () => (
    <Button
      leftIcon={<HeartAdd />}
      onClick={selectMenu.onToggle}
      pos="relative"
      variant="ghost"
      mx="25px"
      w={['100vw', '550px']}
      justifyContent="left"
    >
      Save Song to
      <Icon
        as={selectMenu.isOpen ? ArrowDown2 : ArrowRight2}
        boxSize="25px"
        ml={['auto !important', '40px !important']}
      />
    </Button>
  );

  return (
    <>
      <SaveSongTo />
      <Drawer
        isOpen={selectMenu.isOpen}
        placement="right"
        onClose={selectMenu.onClose}
        finalFocusRef={btnRef}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody overflowX="hidden">
            <Stack pos="fixed" top={0}>
              <header>Save To:</header>
            </Stack>
            <Stack>
              {/* <Input placeholder="find playlist" /> */}
              <Button
                pos="relative"
                variant="ghost"
                mx="25px"
                w={['100vw', '550px']}
                justifyContent="left"
              >
                Save to Liked Songs
              </Button>
              <Button
                pos="relative"
                variant="ghost"
                mx="25px"
                w={['100vw', '550px']}
                justifyContent="left"
                onClick={playlists.onOpen}
              >
                Save to Playlist
              </Button>
              <Button
                pos="relative"
                variant="ghost"
                mx="25px"
                w={['100vw', '550px']}
                justifyContent="left"
              >
                Create New Playlist
              </Button>
            </Stack>
            <Stack pos="fixed" bottom={0}>
              <Button
                variant="drawer"
                onClick={selectMenu.onClose}
                justifyContent="center"
                h="40px"
                pt="10px"
                w="100vw"
              >
                cancel
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Drawer
        isOpen={playlists.isOpen}
        placement="right"
        onClose={playlists.onClose}
        finalFocusRef={btnRef}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody overflowX="hidden">
            <Stack>
              <Text>hiiii</Text>
            </Stack>
            <Stack pos="fixed" bottom={0}>
              <Button
                variant="drawer"
                onClick={playlists.onClose}
                justifyContent="center"
                h="40px"
                pt="10px"
                w="100vw"
              >
                cancel
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SaveTo;
