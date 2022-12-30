// import type { ChakraProps } from '@chakra-ui/react';
import {
  Drawer,
  Image,
  Link,
  DrawerHeader,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  Button,
  useDisclosure,
  Icon,
  Stack,
  DrawerFooter,
  Text,
  Box,
} from '@chakra-ui/react';
import { ArrowDown2, ArrowRight2, DocumentText, LinkCircle, Send2 } from 'iconsax-react';
import { useNavigate, useParams } from '@remix-run/react';
import useSessionUser from '~/hooks/useSessionUser';
import useParamUser from '~/hooks/useParamUser';
import useDrawerStore from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import { useRef, useState } from 'react';
import SaveToLiked from './SaveToLiked';
import useUsers from '~/hooks/useUsers';
import AddQueue from './AddQueue';

const ActionDrawer = () => {
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const { track, onClose } = useDrawerStore();
  const isOpen = track !== null ? true : false;
  const currentUser = useSessionUser();
  const sendMenu = useDisclosure();
  const navigate = useNavigate();
  const allUsers = useUsers();
  const user = useParamUser();
  const { id } = useParams();
  const btnRef = useRef<HTMLButtonElement>(null);

  const isOwnProfile = currentUser?.userId === id;
  const users = allUsers.filter((user) => user.userId !== currentUser?.userId);

  const isSmallScreen = useIsMobile();

  const SendTo = () => (
    <Button
      leftIcon={<Send2 />}
      onClick={sendMenu.onToggle}
      pos="relative"
      variant="ghost"
      mx="25px"
      w={['100vw', '800px']}
      justifyContent="left"
    >
      Add to Friends Queue
      <Icon as={ArrowRight2} boxSize="25px" ml={['auto !important', '40px !important']} />
    </Button>
  );

  const SendToList = () => (
    <>
      {!isOwnProfile && id && track && (
        <AddQueue
          track={{
            trackId: track.trackId,
          }}
          user={user}
        />
      )}
      {track &&
        users.map((user) => (
          <AddQueue
            key={user.userId}
            track={{
              trackId: track.trackId,
            }}
            user={user}
          />
        ))}
    </>
  );
  const Analyze = () => (
    <>
      {track && (
        <Button
          leftIcon={<DocumentText />}
          onClick={() => navigate(`/analysis/${track.trackId}`)}
          variant="ghost"
          justifyContent="left"
          w={['100vw', '800px']}
        >
          Analyze
        </Button>
      )}
    </>
  );
  const AddToYourQueue = () => (
    <>
      {track && (
        <AddQueue
          track={{
            trackId: track.trackId,
            userId: track.userId,
          }}
          user={null}
        />
      )}
    </>
  );
  const CloseMenu = () => {
    const handleClick = () => {
      isOpen && !sendMenu.isOpen ? onClose() : sendMenu.onClose();
    };
    const text = isOpen && !sendMenu.isOpen ? 'close' : 'cancel';
    return (
      <Button variant="drawer" onClick={handleClick} justifyContent="center" h="20px" w="100vw">
        {text}
      </Button>
    );
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="bottom"
        onClose={onClose}
        finalFocusRef={btnRef}
        lockFocusAcrossFrames
        preserveScrollBarGap
        size={['', 'full']}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            {track && (
              <Stack align={['flex-start', 'flex-end']} direction={['column', 'row']}>
                {track.albumUri && (
                  <Link href={track.albumUri} _focus={{ boxShadow: 'none' }}>
                    <Image
                      boxSize={['269px', 334]}
                      objectFit="cover"
                      src={track.image}
                      alignSelf="center"
                      mx="25px"
                    />
                  </Link>
                )}
                <Stack direction="column">
                  <Link
                    href={track.uri}
                    _hover={{ textDecor: 'none' }}
                    onMouseEnter={() => setShow(true)}
                    onMouseLeave={() => setShow(false)}
                    _focus={{ boxShadow: 'none' }}
                  >
                    <Stack direction="row">
                      <Text fontSize={['xl', '5xl']} fontWeight="bold">
                        {track.name}
                      </Text>
                      <Box opacity={show ? 1 : 0} transition="opacity .25s ease-in-out">
                        <LinkCircle />
                      </Box>
                    </Stack>
                  </Link>
                  {track.artistUri && (
                    <Link
                      href={track.artistUri}
                      _hover={{ textDecor: 'none' }}
                      onMouseEnter={() => setShow1(true)}
                      onMouseLeave={() => setShow1(false)}
                      w="fit-content"
                      _focus={{ boxShadow: 'none' }}
                    >
                      <Stack direction="row">
                        <Text color="#BBB8B7">{track.artist}</Text>
                        <Box opacity={show1 ? 1 : 0} transition="opacity .25s ease-in-out">
                          <LinkCircle />
                        </Box>
                      </Stack>
                    </Link>
                  )}
                </Stack>
              </Stack>
            )}
          </DrawerHeader>
          <DrawerBody overflowX="hidden">
            <Stack align={['center', 'flex-start']} pl={['none', '40px !important']}>
              {track && track.trackId && <SaveToLiked trackId={track.trackId} />}
              <Analyze />
              <AddToYourQueue />
              <SendTo />
              {isSmallScreen ? (
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
              ) : (
                <Drawer
                  isOpen={sendMenu.isOpen}
                  placement="right"
                  onClose={sendMenu.onClose}
                  finalFocusRef={btnRef}
                  size="md"
                >
                  <DrawerOverlay />
                  <DrawerContent>
                    <DrawerHeader>To:</DrawerHeader>

                    <DrawerBody overflowX="hidden">
                      <SendToList />
                    </DrawerBody>

                    <DrawerFooter></DrawerFooter>
                  </DrawerContent>
                </Drawer>
              )}
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
