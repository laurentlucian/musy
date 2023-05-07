import { Form, useLocation, useNavigate, useTransition } from '@remix-run/react';
import { useRef } from 'react';
import { LogOut, MoreHorizontal } from 'react-feather';

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  Image,
  forwardRef,
  useColorMode,
  useColorModeValue,
  Button,
  useDisclosure,
  Divider,
  Stack,
  Portal,
} from '@chakra-ui/react';
import type { IconButtonProps } from '@chakra-ui/react';

import { Moon, Profile2User, Setting2, Sun1 } from 'iconsax-react';

import useIsMobile from '~/hooks/useIsMobile';
import { useSaveState, useSetShowAlert } from '~/hooks/useSaveTheme';
import useSessionUser from '~/hooks/useSessionUser';
import SpotifyLogo from '~/lib/icons/SpotifyLogo';
import Waver from '~/lib/icons/Waver';

const UserMenu = () => {
  const currentUser = useSessionUser();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isSmallScreen = useIsMobile();
  const { colorMode, toggleColorMode } = useColorMode();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.700');
  const hoverBg = useColorModeValue('music.400', 'music.900');
  const btnRef = useRef<HTMLButtonElement>(null);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const transition = useTransition();
  const disable = useSaveState();
  const showAlert = useSetShowAlert();
  const handleClick = () => {
    if (disable) {
      showAlert();
    }
  };

  const userIsNya = currentUser?.userId === '02mm0eoxnifin8xdnqwimls4y';
  const userIsDanica = currentUser?.userId === 'danicadboo';
  const customColor = userIsNya ? '#FE5BAC' : userIsDanica ? '#563776' : color;

  const mobileIcon = (
    <Image
      src={currentUser?.image}
      borderRadius="full"
      minW="50px"
      maxW="50px"
      minH="50px"
      maxH="50px"
    />
  );
  const icon = (
    <Image
      src={currentUser?.image}
      borderRadius="full"
      minW={['40px', 30]}
      maxW={['40px', 30]}
      minH={['40px', 30]}
      maxH={['40px', 30]}
    />
  );

  const iconButton = forwardRef<IconButtonProps, 'button'>(({ ...props }, ref) => (
    <IconButton icon={icon} {...props} ref={ref} m={0} />
  ));

  const onClickUser = () => {
    if (!pathname.includes(`${currentUser?.userId}`)) {
      navigate(`/${currentUser?.userId}`);
      onClose();
    } else {
      onClose();
    }
  };

  const onClickSettings = () => {
    navigate(`/settings`);
    onClose();
  };
  const onClickFriends = () => {
    navigate(`/friends`);
    onClose();
  };
  let reloadTimeout: NodeJS.Timeout;
  const onClickToggleTheme = () => {
    toggleColorMode();
    clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(() => {
      location.reload();
    }, 100);
  };

  return (
    <>
      {isSmallScreen ? (
        <>
          <IconButton
            aria-label="your actions"
            ref={btnRef}
            onClick={onOpen}
            icon={<MoreHorizontal />}
            bg="#0000 !important"
            boxShadow="none"
            pos="fixed"
            top={2}
            right="0"
            color={customColor}
          />
          <Drawer
            isOpen={isOpen}
            placement="top"
            onClose={onClose}
            finalFocusRef={btnRef}
            size="xs"
            variant="mobileAvatarDrawer"
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerBody flexDirection="column" bg={bg} color={color} borderBottomRadius="5%">
                <Stack align="flex-start" pb="20px">
                  <Stack w="100%" h="40px">
                    <DrawerCloseButton />
                  </Stack>
                  <Button
                    leftIcon={mobileIcon}
                    iconSpacing="20px"
                    bg="#0000"
                    w="100%"
                    h="70px"
                    fontSize="20px"
                    justifyContent="left"
                    onMouseEnter={onClickUser}
                    color={color}
                    opacity={0.8}
                    _hover={{ bg: hoverBg, boxShadow: 'none', opacity: 1 }}
                  >
                    {currentUser?.name}
                  </Button>
                  <Button
                    leftIcon={<Profile2User variant="Bold" size="30px" />}
                    iconSpacing="30px"
                    onClick={() => {
                      navigate(`/home/friends`);
                      onClose();
                    }}
                    bg="#0000"
                    size="20px"
                    pl="25px"
                    w="100%"
                    h="45px"
                    justifyContent="flex-start"
                    color={color}
                    opacity={0.8}
                    _hover={{ bg: hoverBg, boxShadow: 'none', opacity: 1 }}
                  >
                    friends
                  </Button>
                  <Divider
                    border={`solid white 1px`}
                    w="90%"
                    ml="9px"
                    opacity={0.2}
                    alignSelf="center"
                  />
                  <Button
                    leftIcon={<Setting2 size="30px" />}
                    iconSpacing="30px"
                    onClick={onClickSettings}
                    bg="#0000"
                    size="20px"
                    pl="25px"
                    mt="10px"
                    w="100%"
                    h="45px"
                    justifyContent="flex-start"
                    color={color}
                    opacity={0.8}
                    _hover={{ bg: hoverBg, boxShadow: 'none', opacity: 1 }}
                  >
                    settings
                  </Button>
                  <Button
                    onClick={toggleColorMode}
                    leftIcon={
                      colorMode === 'light' ? (
                        <Moon variant="Bold" size="30px" />
                      ) : (
                        <Sun1 variant="Bold" size="30px" />
                      )
                    }
                    iconSpacing="30px"
                    bg="#0000"
                    size="20px"
                    pl="25px"
                    mt="10px"
                    w="100%"
                    h="45px"
                    justifyContent="flex-start"
                    color={color}
                    opacity={0.8}
                    _hover={{ bg: hoverBg, boxShadow: 'none', opacity: 1 }}
                  >
                    toggle theme
                  </Button>
                  <Divider
                    border={`solid white 1px`}
                    w="90%"
                    ml="9px"
                    opacity={0.2}
                    alignSelf="center"
                  />
                  {currentUser ? (
                    <Form action="/logout" method="post">
                      <Button
                        leftIcon={<LogOut transform="scale(-1)" size="30px" />}
                        iconSpacing="30px"
                        _hover={{ bgColor: 'red.500', color: 'white' }}
                        type="submit"
                        bg="#0000"
                        size="20px"
                        pl="25px"
                        mt="20px"
                        w="100vw"
                        h="45px"
                        justifyContent="flex-start"
                        color={color}
                      >
                        log out
                      </Button>
                    </Form>
                  ) : (
                    <Form action={'/auth/spotify?returnTo=' + pathname} method="post">
                      <Button
                        type="submit"
                        variant="login"
                        spinner={<Waver />}
                        isLoading={transition.submission?.action.includes('auth')}
                        bg={bg}
                        color={color}
                      >
                        Login with &nbsp; <SpotifyLogo h="24px" w="85px" link={false} />
                      </Button>
                    </Form>
                  )}
                </Stack>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <Menu placement="bottom-end">
          <MenuButton
            aria-label="your actions"
            as={iconButton}
            onClick={handleClick}
            variant="unstyled"
            isRound
            disabled={disable}
          />
          <Portal>
            <MenuList
              overflowX="clip"
              bg={bg}
              boxShadow="0px 0px 10px 2px rgba(117,117,117,0.69)"
              rounded="xl"
              zIndex={9}
            >
              <MenuItem
                as="a"
                href={`/${currentUser?.userId}`}
                icon={icon}
                ml="-5px"
                mr="8px"
                bg={bg}
                color={color}
              >
                {currentUser?.name}
              </MenuItem>
              <MenuItem
                icon={<Profile2User variant="Bold" />}
                onClick={onClickFriends}
                bg={bg}
                color={color}
              >
                friends
              </MenuItem>
              <MenuDivider
                border={`solid ${color} 1px`}
                w="90%"
                ml="9px"
                opacity={0.2}
                alignSelf="center"
              />
              <MenuItem icon={<Setting2 />} onClick={onClickSettings} bg={bg} color={color}>
                settings
              </MenuItem>
              <MenuItem
                onClick={onClickToggleTheme}
                icon={colorMode === 'light' ? <Moon variant="Bold" /> : <Sun1 variant="Bold" />}
                closeOnSelect={false}
                bg={bg}
                color={color}
              >
                toggle theme
              </MenuItem>
              <MenuDivider
                border={`solid ${color} 1px`}
                w="90%"
                ml="9px"
                opacity={0.2}
                alignSelf="center"
              />
              <Form action="/logout" method="post">
                <MenuItem
                  icon={<LogOut transform="scale(-1)" />}
                  _hover={{ bgColor: 'red.500', color: 'white' }}
                  type="submit"
                  bg={bg}
                  color={color}
                >
                  log out
                </MenuItem>
              </Form>
            </MenuList>
          </Portal>
        </Menu>
      )}
    </>
  );
};
export default UserMenu;
