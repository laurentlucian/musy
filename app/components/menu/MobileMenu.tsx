import {
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  // DrawerCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Icon,
  Stack,
  DrawerFooter,
  Image,
  Text,
  Portal,
  Collapse,
} from '@chakra-ui/react';
import { ArrowDown2, ArrowRight2, DocumentText, More, Send2 } from 'iconsax-react';
import { useNavigate } from '@remix-run/react';
import { type Profile } from '@prisma/client';
import SaveToLiked from './SaveToLiked';
import AddQueue from './AddQueue';
import { useRef } from 'react';

interface MobileMenuConfig {
  isOwnProfile: boolean;
  user: Profile | null;
  users: Profile[];
  id: string | undefined;
  isSmallScreen: boolean;
  track: {
    trackId: string;
    uri: string;
    image: string;
    albumUri: string | null;
    albumName: string | null;
    name: string;
    artist: string | null;
    artistUri: string | null;
    explicit: boolean;
    userId?: string;
  };
}
// save heart Icon isn't aligned with the rest zzz
const MobileMenu = ({
  isOwnProfile,
  user,
  users,
  id,
  isSmallScreen,
  track: { trackId, uri, image, albumUri, albumName, name, artist, artistUri, explicit, userId },
}: MobileMenuConfig) => {
  const menu = useDisclosure();
  const sendMenu = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const SendTo = () => (
    <Button leftIcon={<Send2 />} onClick={sendMenu.onToggle} pos="relative" variant="drawer">
      Add to Friends Queue
      <Icon
        as={sendMenu.isOpen ? ArrowDown2 : ArrowRight2}
        boxSize="25px"
        ml="auto !important"
        pos="absolute"
        right="10px"
      />
    </Button>
  );
  const SendToList = () => (
    <>
      {!isOwnProfile && id && (
        <AddQueue
          track={{
            trackId,
            uri,
            image,
            albumUri,
            albumName,
            name,
            artist,
            artistUri,
            explicit,
          }}
          user={user}
          isSmallScreen={isSmallScreen}
        />
      )}
      {users.map((user) => (
        <AddQueue
          key={user.userId}
          track={{
            trackId,
            uri,
            image,
            albumUri,
            albumName,
            name,
            artist,
            artistUri,
            explicit,
          }}
          user={user}
          isSmallScreen={isSmallScreen}
        />
      ))}
    </>
  );
  const Analyze = () => (
    <Button
      leftIcon={<DocumentText />}
      onClick={() => navigate(`/analysis/${trackId}`)}
      variant="drawer"
    >
      Analyze
    </Button>
  );
  const AddToYourQueue = () => (
    <>
      <AddQueue
        track={{
          trackId,
          uri,
          image,
          albumUri,
          albumName,
          name,
          artist,
          artistUri,
          explicit,
          userId,
        }}
        user={null}
        isSmallScreen={isSmallScreen}
      />
    </>
  );
  // const SendMenu = () => (
  //   <Portal>
  //     <Drawer
  //       isOpen={sendMenu.isOpen}
  //       onClose={sendMenu.onClose}
  //       size="xl"
  //       placement="bottom"
  //       lockFocusAcrossFrames
  //       preserveScrollBarGap
  //       initialFocusRef={btnRef}
  //     >
  //       <DrawerOverlay />
  //       <DrawerContent>
  //         <DrawerHeader>
  //           <Stack align="center"></Stack>
  //         </DrawerHeader>
  //         <DrawerBody>
  //           <Stack align="center">
  //             <SendToList />
  //           </Stack>
  //         </DrawerBody>
  //         <DrawerFooter>
  //           <CloseMenu />
  //         </DrawerFooter>
  //       </DrawerContent>
  //     </Drawer>
  //   </Portal>
  // );
  // const SendMenu = () => (
  //   <Collapse in={sendMenu.isOpen}>
  //     <Stack align="center">
  //       <SendToList />
  //     </Stack>
  //   </Collapse>
  // );

  const SendMenu = () => (
    <Portal>
      <Drawer
        isOpen={sendMenu.isOpen}
        onClose={sendMenu.onClose}
        size="xl"
        placement="bottom"
        lockFocusAcrossFrames
        preserveScrollBarGap
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <Stack align="center"></Stack>
          </DrawerHeader>
          <DrawerBody>
            <Stack align="center">
              <SendToList />
            </Stack>
          </DrawerBody>
          <DrawerFooter>
            <CloseMenu />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Portal>
  );
  const CloseMenu = () => {
    const handleClick = () => {
      menu.isOpen && !sendMenu.isOpen ? menu.onClose() : sendMenu.onClose();
    };
    const text = menu.isOpen && !sendMenu.isOpen ? 'close' : 'cancel';
    return (
      <Button variant="drawer" onClick={handleClick} justifyContent="center">
        {text}
      </Button>
    );
  };
  const Menu = () => {
    return (
      <Drawer
        isOpen={menu.isOpen}
        placement="bottom"
        onClose={menu.onClose}
        finalFocusRef={btnRef}
        lockFocusAcrossFrames
        preserveScrollBarGap
      >
        <DrawerOverlay />
        {/* <DrawerCloseButton /> */}
        <DrawerContent>
          <DrawerHeader>
            <Stack align="center">
              <Image boxSize="230px" objectFit="cover" src={image} alignSelf="center" />
              <Text>{name}</Text>
            </Stack>
          </DrawerHeader>

          <DrawerBody>
            <Stack align="center" h="300px">
              <Analyze />
              <AddToYourQueue />
              <SendTo />
              <SendMenu />
            </Stack>
          </DrawerBody>

          <DrawerFooter>
            <CloseMenu />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  };

  return (
    <>
      <IconButton
        ref={btnRef}
        aria-label="options"
        icon={<More />}
        variant="ghost"
        boxShadow="none"
        _active={{ boxShadow: 'none' }}
        _hover={{ boxShadow: 'none', color: 'spotify.green' }}
        onClick={menu.onOpen}
      />
      {/* <Menu /> */}
      <Drawer
        isOpen={menu.isOpen}
        placement="bottom"
        onClose={menu.onClose}
        finalFocusRef={btnRef}
        lockFocusAcrossFrames
        preserveScrollBarGap
      >
        <DrawerOverlay />
        {/* <DrawerCloseButton /> */}
        <DrawerContent>
          <DrawerHeader>
            <Stack align="center">
              <Image boxSize="230px" objectFit="cover" src={image} alignSelf="center" />
              <Text>{name}</Text>
            </Stack>
          </DrawerHeader>

          <DrawerBody>
            <Stack align="center" h="300px">
              <SaveToLiked trackId={trackId} isSmallScreen={isSmallScreen} />
              <Analyze />
              <AddToYourQueue />
              <SendTo />
              <SendMenu />
            </Stack>
          </DrawerBody>

          <DrawerFooter>
            <CloseMenu />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
export default MobileMenu;
