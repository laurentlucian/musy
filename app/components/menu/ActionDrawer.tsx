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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Flex,
  Input,
  Collapse,
  IconButton,
} from '@chakra-ui/react';
import {
  ArrowDown2,
  ArrowRight2,
  CloseCircle,
  LinkCircle,
  RefreshCircle,
  Send2,
} from 'iconsax-react';
import { useDrawerActions, useDrawerTrack } from '~/hooks/useDrawer';
import { type ChangeEvent, useRef, useState, useEffect } from 'react';
import useSessionUser from '~/hooks/useSessionUser';
import useParamUser from '~/hooks/useParamUser';
import useIsMobile from '~/hooks/useIsMobile';
import { useParams, useTransition } from '@remix-run/react';
import AnalyzeTrack from './AnalyzeTrack';
import SaveToLiked from './SaveToLiked';
import useUsers from '~/hooks/useUsers';
import Recommend from './Recommend';
import AddQueue from './AddQueue';
import LikedBy from './LikedBy';
import PlayPreview from './PlayPreview';
// import SaveTo from './SaveTo';

const ActionDrawer = () => {
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [sendList, setSendList] = useState(false);
  const [comment, setComment] = useState('');
  const { onClose } = useDrawerActions();
  const track = useDrawerTrack();
  const isOpen = track !== null ? true : false;
  const currentUser = useSessionUser();
  const sendMenu = useDisclosure();
  const allUsers = useUsers();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { type } = useTransition();
  const isSmallScreen = useIsMobile();
  const { id } = useParams();
  const user = useParamUser();

  useEffect(() => {
    if (!isOpen && type === 'normalLoad') {
      onClose();
    }
  }, [isOpen, type, onClose]);

  const isOwnProfile = currentUser?.userId === id;

  const textOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };

  const queueableUsers = allUsers.filter((user) => {
    const isAllowed =
      user.settings === null ||
      user.settings.allowQueue === null ||
      user.settings.allowQueue === 'on';
    return user.userId !== currentUser?.userId && isAllowed;
  });
  const recommendableUsers = allUsers.filter((user) => {
    const isAllowed =
      user.settings === null ||
      user.settings.allowRecommend === null ||
      user.settings.allowRecommend === 'on';
    return user.userId !== currentUser?.userId && isAllowed;
  });

  const onClickQueue = () => {
    setSendList(false);
    if (!sendList && sendMenu.isOpen) {
      sendMenu.onClose();
    } else sendMenu.onOpen();
  };
  const onClickRecommend = () => {
    setSendList(true);
    if (sendList && sendMenu.isOpen) {
      sendMenu.onClose();
    } else sendMenu.onOpen();
  };
  const SendTo = () => (
    <Button
      leftIcon={<Send2 />}
      onClick={onClickQueue}
      pos="relative"
      variant="ghost"
      mx="25px"
      w={['100vw', '550px']}
      justifyContent="left"
      color="music.200"
      _hover={{ color: 'white' }}
    >
      Add to Friends Queue
      <Icon
        as={sendMenu.isOpen && !sendList ? ArrowDown2 : ArrowRight2}
        boxSize="25px"
        ml={['auto !important', '40px !important']}
      />
    </Button>
  );
  const RecommendTo = () => (
    <Button
      leftIcon={<Send2 />}
      onClick={onClickRecommend}
      pos="relative"
      variant="ghost"
      mx="25px"
      w={['100vw', '550px']}
      justifyContent="left"
      color="music.200"
      _hover={{ color: 'white' }}
    >
      Recommend to Friend
      <Icon
        as={sendMenu.isOpen && sendList ? ArrowDown2 : ArrowRight2}
        boxSize="25px"
        ml={['auto !important', '36px !important']}
      />
    </Button>
  );
  const CloseMenu = () => {
    const handleClick = () => {
      isOpen && !sendMenu.isOpen ? onClose() : sendMenu.onClose();
    };
    const text = isOpen && !sendMenu.isOpen ? 'close' : 'cancel';
    return (
      <Button variant="drawer" onClick={handleClick} h={['10px', '40px']} pt="10px" w="100vw">
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
        size="full"
        variant={isSmallScreen ? 'none' : 'desktop'}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody>
            <Stack direction={['column', 'row']} align="center" justify="center">
              {track && (
                <Stack align={['center', 'flex-start']} direction={['column']} maxW={510}>
                  {isSmallScreen && (
                    <>
                      <Box h="90px" w="10px" />
                      <LikedBy />
                    </>
                  )}
                  {track.albumUri && (
                    <Link href={track.albumUri} _focus={{ boxShadow: 'none' }}>
                      <Image
                        boxSize={['350px', '369px', 500]}
                        objectFit="cover"
                        src={track.image}
                        alignSelf="center"
                        mr={['0', '25px']}
                        mt={[0, '100px']}
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
                {/* {track && track.trackId && <SaveToPlaylist  trackId={track.trackId} />} */}
                {/* <SaveTo currentUserId={currentUser?.userId}/> */} {/* WIP */}
                {track && <AnalyzeTrack trackId={track.trackId} />}
                {track && <PlayPreview preview_url={track.preview_url} />}
                {track && (
                  <AddQueue
                    track={{
                      trackId: track.trackId,
                      userId: track.userId,
                    }}
                    user={null}
                  />
                )}
                {queueableUsers.length > 0 && <SendTo />}
                {recommendableUsers.length > 0 && <RecommendTo />}
                {isSmallScreen ? (
                  <>
                    <Box h="50px" w="10px" />
                    <Drawer
                      isOpen={sendMenu.isOpen}
                      onClose={sendMenu.onClose}
                      size="full"
                      placement="right"
                      lockFocusAcrossFrames
                      preserveScrollBarGap
                      finalFocusRef={btnRef}
                      variant="nested"
                    >
                      <DrawerContent>
                        <DrawerHeader>
                          <Text>To:</Text>
                          <DrawerCloseButton color="spotify.green" fontSize="20px" />
                        </DrawerHeader>
                        <DrawerBody>
                          <Stack align="center">
                            {!sendList ? (
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
                                  queueableUsers.map((user) => (
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
                            ) : (
                              <Stack>
                                {track &&
                                  recommendableUsers.map((user) => (
                                    <Recommend
                                      key={user.userId}
                                      user={user}
                                      // users={recommendableUsers}
                                    />
                                  ))}
                              </Stack>
                            )}
                          </Stack>
                        </DrawerBody>
                        <DrawerFooter>
                          <CloseMenu />
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  </>
                ) : (
                  // <SlideFade in={sendMenu.isOpen} offsetY="-20px">
                  //   <Box overflowY="scroll" h="330px">
                  //     {!sendList ? (
                  //       <Stack>
                  //         {/* {!isOwnProfile && id && track && (
                  //           <AddQueue
                  //             track={{
                  //               trackId: track.trackId,
                  //             }}
                  //             user={user}
                  //           />
                  //         )} */}

                  //         {track &&
                  //           queueableUsers.map((user) => (
                  //             <AddQueue
                  //               key={user.userId}
                  //               track={{
                  //                 trackId: track.trackId,
                  //               }}
                  //               user={user}
                  //             />
                  //           ))}
                  //       </Stack>
                  //     ) : (
                  //       <Stack>
                  //         {track &&
                  //           recommendableUsers.map((user) => (
                  //             <Recommend key={user.userId} user={user} />
                  //           ))}
                  //       </Stack>
                  //     )}
                  //   </Box>
                  // </SlideFade>
                  <>
                    <Modal
                      isCentered
                      onClose={sendMenu.onClose}
                      isOpen={sendMenu.isOpen}
                      motionPreset="slideInBottom"
                      preserveScrollBarGap
                    >
                      <ModalOverlay />
                      <ModalContent>
                        <ModalHeader alignSelf="center">
                          {sendList ? 'Recommend' : 'Queue'}
                          <IconButton
                            aria-label={`switch to ${sendList ? 'recommend' : 'queue'}`}
                            icon={<RefreshCircle />}
                            onClick={() => setSendList(!sendList)}
                            pos="absolute"
                            right="40px"
                          />
                          <IconButton
                            aria-label="close"
                            icon={<CloseCircle />}
                            onClick={sendMenu.onClose}
                            pos="absolute"
                            right="10px"
                          />
                        </ModalHeader>
                        <ModalBody>
                          <Box overflowY="scroll" h="330px">
                            {!sendList ? (
                              <Stack overflowX="hidden">
                                {!isOwnProfile && id && track && (
                                  <AddQueue
                                    track={{
                                      trackId: track.trackId,
                                    }}
                                    user={user}
                                  />
                                )}
                                {track &&
                                  queueableUsers.map((user) => (
                                    <AddQueue
                                      key={user.userId}
                                      track={{
                                        trackId: track.trackId,
                                      }}
                                      user={user}
                                    />
                                  ))}
                              </Stack>
                            ) : (
                              <Stack overflowX="hidden">
                                {track &&
                                  recommendableUsers.map((user) => (
                                    <Recommend key={user.userId} user={user} comment={comment} />
                                  ))}
                              </Stack>
                            )}
                          </Box>
                        </ModalBody>
                        <ModalFooter
                          flexDirection="column"
                          h={sendList ? '69px' : 'auto'}
                          justifyContent="space-between"
                          mx="-12px"
                        >
                          <Collapse in={sendList} animateOpacity>
                            <Input
                              variant="unstyled"
                              placeholder="add comment..."
                              w="425px"
                              name="comment"
                              onChange={textOnChange}
                            />
                          </Collapse>
                          {/* <Button w="100%" onClick={sendMenu.onClose}>
                            {sendList ? 'send' : 'queue'}
                          </Button> */}
                        </ModalFooter>
                      </ModalContent>
                    </Modal>
                  </>
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
