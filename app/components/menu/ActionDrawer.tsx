import {
  Drawer,
  Image,
  Link,
  DrawerHeader,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  useDisclosure,
  Icon,
  Stack,
  DrawerFooter,
  Text,
  Box,
  SlideFade,
  Flex,
} from '@chakra-ui/react';
import { ArrowDown2, ArrowRight2, LinkCircle, Send2 } from 'iconsax-react';
import { useParams } from '@remix-run/react';
import useSessionUser from '~/hooks/useSessionUser';
import useParamUser from '~/hooks/useParamUser';
import useIsMobile from '~/hooks/useIsMobile';
import { useRef, useState } from 'react';
import SaveToLiked from './SaveToLiked';
import useUsers from '~/hooks/useUsers';
import AddQueue from './AddQueue';
import AnalyzeTrack from './AnalyzeTrack';
import { useDrawerActions, useDrawerTrack } from '~/hooks/useDrawer';
import LikedBy from './LikedBy';

const ActionDrawer = () => {
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  // const [users, setUsers] = useState<Profile[]>([]);
  const { onClose } = useDrawerActions();
  const track = useDrawerTrack();
  const isOpen = track !== null ? true : false;
  const currentUser = useSessionUser();
  const sendMenu = useDisclosure();
  const allUsers = useUsers();
  const user = useParamUser();
  const { id } = useParams();
  const btnRef = useRef<HTMLButtonElement>(null);

  const isOwnProfile = currentUser?.userId === id;
  const users = allUsers.filter((user) => {
    const isAllowed = user.settings === null || user.settings.allowQueue === 'on';
    return user.userId !== currentUser?.userId && isAllowed;
  });
  console.log('users', users);
  const isSmallScreen = useIsMobile();

  const SendTo = () => (
    <Button
      leftIcon={<Send2 />}
      onClick={sendMenu.onToggle}
      pos="relative"
      variant="ghost"
      mx="25px"
      w={['100vw', '550px']}
      justifyContent="left"
      color="music.200"
    >
      Add to Friends Queue
      <Icon
        as={sendMenu.isOpen ? ArrowDown2 : ArrowRight2}
        boxSize="25px"
        ml={['auto !important', '40px !important']}
      />
    </Button>
  );

  const CloseMenu = () => {
    const handleClick = () => {
      isOpen && !sendMenu.isOpen ? onClose() : sendMenu.onClose();
    };
    const text = isOpen && !sendMenu.isOpen ? 'close' : 'cancel';
    return (
      <Button
        variant="drawer"
        onClick={handleClick}
        justifyContent="center"
        h={['10px', '40px']}
        pt="10px"
        w="100vw"
      >
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
        variant={isSmallScreen ? 'none' : 'desktop'}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader></DrawerHeader>
          <DrawerBody overflowX="hidden">
            <Stack direction={['column', 'row']} align="center" justify="center">
              {track && (
                <Stack align={['center', 'flex-start']} direction={['column']} maxW={510}>
                  {isSmallScreen && <LikedBy />}
                  {track.albumUri && (
                    <Link href={track.albumUri} _focus={{ boxShadow: 'none' }}>
                      <Image
                        boxSize={['350px', '369px', 500]}
                        objectFit="cover"
                        src={track.image}
                        alignSelf="center"
                        mr={['0', '25px']}
                      />
                    </Link>
                  )}
                  <Link
                    href={track.uri}
                    _hover={{ textDecor: 'none' }}
                    onMouseEnter={() => setShow(true)}
                    onMouseLeave={() => setShow(false)}
                    _focus={{ boxShadow: 'none' }}
                  >
                    <Text
                      fontSize={['xl', '5xl']}
                      fontWeight="bold"
                      textAlign="left"
                      w="fit-content"
                      wordBreak="break-word"
                      pos="relative"
                    >
                      {track.name}
                      <Flex
                        as="span"
                        alignItems="center"
                        pos="absolute"
                        left="-25px"
                        top="0"
                        bottom="0"
                        opacity={show ? 1 : 0}
                        transition="opacity .25s ease-in-out"
                      >
                        <LinkCircle size="20px" />
                      </Flex>
                    </Text>
                  </Link>
                  {track.artistUri && (
                    <Link
                      href={track.artistUri}
                      _hover={{ textDecor: 'none' }}
                      onMouseEnter={() => setShow1(true)}
                      onMouseLeave={() => setShow1(false)}
                      w="fit-content"
                      _focus={{ boxShadow: 'none' }}
                      pos="relative"
                    >
                      <Stack direction="row">
                        <Text color="#BBB8B7">
                          {track.artist}
                          <Flex
                            as="span"
                            alignItems="center"
                            pos="absolute"
                            left="-25px"
                            top="0"
                            bottom="0"
                            opacity={show1 ? 1 : 0}
                            transition="opacity .25s ease-in-out"
                          >
                            <LinkCircle size="20px" />
                          </Flex>
                        </Text>
                      </Stack>
                    </Link>
                  )}
                  {!isSmallScreen && <LikedBy />}
                </Stack>
              )}
              <Stack pl={['none', '40px !important']} mt={['none', '300px !important']}>
                {track && track.trackId && <SaveToLiked trackId={track.trackId} />}
                {track && <AnalyzeTrack trackId={track.trackId} />}
                {/* AddToYourQueue */}
                {track && (
                  <AddQueue
                    track={{
                      trackId: track.trackId,
                      userId: track.userId,
                    }}
                    user={null}
                  />
                )}
                <SendTo />
                {isSmallScreen ? (
                  <Drawer
                    isOpen={sendMenu.isOpen}
                    onClose={sendMenu.onClose}
                    size="full"
                    placement="right"
                    lockFocusAcrossFrames
                    preserveScrollBarGap
                    finalFocusRef={btnRef}
                  >
                    <DrawerOverlay />
                    <DrawerContent backdropBlur="28px">
                      <DrawerHeader>
                        <Stack>
                          <Text>To:</Text>
                          <DrawerCloseButton color="spotify.green" />
                        </Stack>
                      </DrawerHeader>
                      <DrawerBody>
                        <Stack align="center">
                          {/* SendToList */}
                          <Stack>
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
                            <Box h="150px" />
                          </Stack>
                        </Stack>
                      </DrawerBody>
                      <DrawerFooter>
                        <CloseMenu />
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                ) : (
                  // <Drawer
                  //   isOpen={sendMenu.isOpen}
                  //   placement="right"
                  //   onClose={sendMenu.onClose}
                  //   finalFocusRef={btnRef}
                  //   size="md"
                  // >
                  //   <DrawerOverlay />
                  //   <DrawerContent>
                  //     <DrawerHeader>To:</DrawerHeader>
                  //     <DrawerBody overflowX="hidden">
                  //       <SendToList />
                  //     </DrawerBody>
                  //     <DrawerFooter></DrawerFooter>
                  //   </DrawerContent>
                  // </Drawer>
                  // <Collapse in={sendMenu.isOpen} animateOpacity>
                  //   <SendToList />
                  // </Collapse>
                  <SlideFade in={sendMenu.isOpen} offsetY="-20px">
                    <Box overflowY="scroll" h="390px">
                      {/* SendToList */}
                      <Stack>
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
                      </Stack>
                    </Box>
                  </SlideFade>
                )}
              </Stack>
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
