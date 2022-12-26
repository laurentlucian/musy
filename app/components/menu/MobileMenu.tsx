import {
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Icon,
  Stack,
  DrawerFooter,
  Collapse,
  Image,
} from '@chakra-ui/react';
import { ArrowRight2, DocumentText, More, Send2 } from 'iconsax-react';
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
      <Icon as={ArrowRight2} boxSize="25px" ml="auto !important" pos="absolute" right="10px" />
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
  const SendMenu = () => (
    <Collapse in={sendMenu.isOpen} animateOpacity={false}>
      <SendToList />
    </Collapse>
  );
  const CloseMenu = () => (
    <Button variant="drawer" onClick={menu.onClose} justifyContent="center">
      close
    </Button>
  );

  const Menu = () => {
    return (
      <Drawer isOpen={menu.isOpen} onClose={menu.onClose} size="xl" placement="bottom">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <Image boxSize="230px" objectFit="cover" src={image} alignSelf="center" />
          <DrawerHeader>{name}</DrawerHeader>

          <DrawerBody>
            <Stack align="center">
              <SendTo />
              <SendMenu />
              <Analyze />
              <AddToYourQueue />
              <SaveToLiked trackId={trackId} isSmallScreen={isSmallScreen} />
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
      <Menu />
    </>
  );
};
export default MobileMenu;
