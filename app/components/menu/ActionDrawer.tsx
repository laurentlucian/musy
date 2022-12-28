import type { ChakraProps } from '@chakra-ui/react';
import { Image } from '@chakra-ui/react';
import {
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  Button,
  useDisclosure,
  IconButton,
  Icon,
  Stack,
  DrawerFooter,
  Text,
} from '@chakra-ui/react';
import { ArrowDown2, ArrowRight2, DocumentText, More, Send2 } from 'iconsax-react';
import { useNavigate, useParams } from '@remix-run/react';
import SaveToLiked from './SaveToLiked';
import AddQueue from './AddQueue';
import { useRef } from 'react';
import useUsers from '~/hooks/useUsers';
import useParamUser from '~/hooks/useParamUser';
import useSessionUser from '~/hooks/useSessionUser';

type ActionDrawerConfig = {
  track: {
    trackId: string;
    name: string;
    image: string;
    // this is used by ActivityFeed to let prisma know from who the track is from (who sent, or liked)
    userId?: string;
  };
} & ChakraProps;

const ActionDrawer = ({ track: { trackId, name, image, userId } }: ActionDrawerConfig) => {
  const currentUser = useSessionUser();
  const sendMenu = useDisclosure();
  const navigate = useNavigate();
  const menu = useDisclosure();
  const allUsers = useUsers();
  const user = useParamUser();
  const { id } = useParams();
  const btnRef = useRef<HTMLButtonElement>(null);

  const isOwnProfile = currentUser?.userId === id;
  const users = allUsers.filter((user) => user.userId !== currentUser?.userId);

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
          }}
          user={user}
        />
      )}
      {users.map((user) => (
        <AddQueue
          key={user.userId}
          track={{
            trackId,
          }}
          user={user}
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
    <AddQueue
      track={{
        trackId,
        userId,
      }}
      user={null}
    />
  );
  const CloseMenu = () => {
    const handleClick = () => {
      menu.isOpen && !sendMenu.isOpen ? menu.onClose() : sendMenu.onClose();
    };
    const text = menu.isOpen && !sendMenu.isOpen ? 'close' : 'cancel';
    return (
      <Button variant="drawer" onClick={handleClick} justifyContent="center" h="6.9px" w="100vw">
        {text}
      </Button>
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
        _active={{ boxShadow: 'none !important', outline: 'none !important' }}
        _hover={{
          boxShadow: 'none !important',
          outline: 'none !important',
          color: 'spotify.green',
        }}
        outline="none !important"
        onClick={menu.onOpen}
      />
      <Drawer
        // isOpen={name === 'Enigma' ? true : menu.isOpen}
        isOpen={menu.isOpen}
        placement="bottom"
        onClose={menu.onClose}
        finalFocusRef={btnRef}
        lockFocusAcrossFrames
        preserveScrollBarGap
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <Stack align="center">
              <Image boxSize="230px" objectFit="cover" src={image} alignSelf="center" />
              <Text>{name}</Text>
            </Stack>
          </DrawerHeader>
          {/* w={{ base: '100vw', sm: '450px', md: '750px', xl: '1100px' }} px={13} */}
          <DrawerBody>
            <Stack align="center">
              <SaveToLiked trackId={trackId} />
              <Analyze />
              <AddToYourQueue />
              <SendTo />
              <Drawer
                isOpen={sendMenu.isOpen}
                onClose={sendMenu.onClose}
                size="full"
                placement="bottom"
                lockFocusAcrossFrames
                preserveScrollBarGap
                finalFocusRef={btnRef}
              >
                <DrawerOverlay />
                <DrawerContent>
                  <DrawerHeader>
                    <Stack>
                      <Text>To:</Text>
                    </Stack>
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
export default ActionDrawer;
