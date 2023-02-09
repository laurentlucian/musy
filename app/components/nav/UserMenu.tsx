import { Form, useNavigate } from '@remix-run/react';
import { useRef } from 'react';
import { LogOut } from 'react-feather';

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

import useSessionUser from '~/hooks/useSessionUser';

interface UserActionsConfig {
  isSmallScreen: boolean;
}

const UserMenu = ({ isSmallScreen }: UserActionsConfig) => {
  const currentUser = useSessionUser();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.700');
  const hoverBg = useColorModeValue('music.400', 'music.900');
  const btnRef = useRef<HTMLButtonElement>(null);
  const { isOpen, onClose, onOpen } = useDisclosure();

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
    navigate(`/${currentUser?.userId}`);
    onClose();
  };

  const onClickSettings = () => {
    navigate(`/settings`);
    onClose();
  };
  const onClickFriends = () => {
    navigate(`/home/friends`);
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
            icon={icon}
            bg="#0000 !important"
            boxShadow="none"
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
                    _hover={{ boxShadow: 'none', opacity: 1, bg: hoverBg }}
                  >
                    {currentUser?.name}
                  </Button>
                  <Button
                    leftIcon={<Profile2User variant="Bold" size="30px" />}
                    iconSpacing="30px"
                    onClick={onClickFriends}
                    bg="#0000"
                    size="20px"
                    pl="25px"
                    w="100%"
                    h="45px"
                    justifyContent="flex-start"
                    color={color}
                    opacity={0.8}
                    _hover={{ boxShadow: 'none', opacity: 1, bg: hoverBg }}
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
                    _hover={{ boxShadow: 'none', opacity: 1, bg: hoverBg }}
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
                    _hover={{ boxShadow: 'none', opacity: 1, bg: hoverBg }}
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
                </Stack>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <Menu placement="bottom-end">
          <MenuButton aria-label="your actions" as={iconButton} variant="unstyled" isRound />
          <Portal>
            <MenuList
              overflowX="clip"
              bg={bg}
              boxShadow="0px 0px 10px 2px rgba(117,117,117,0.69)"
              rounded="xl"
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
