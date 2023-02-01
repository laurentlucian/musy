import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  IconButton,
  Image,
  forwardRef,
  IconButtonProps,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { Form, useNavigate } from '@remix-run/react';
import { Moon, Profile2User, Setting2, Sun1 } from 'iconsax-react';
import { LogOut } from 'react-feather';
import useSessionUser from '~/hooks/useSessionUser';

// interface UserActionsConfig {

// }

const UserMenu = () => {
  const currentUser = useSessionUser();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.900');

  const icon = (
    <Image src={currentUser?.image} borderRadius="full" minW={30} maxW={30} minH={30} maxH={30} />
  );

  const iconButton = forwardRef<IconButtonProps, 'button'>(({ ...props }, ref) => (
    <IconButton icon={icon} {...props} ref={ref} m={0} />
  ));

  const onClickSettings = () => {
    navigate(`/settings`);
  };
  const onClickFriends = () => {
    navigate(`/home/friends`);
  };

  return (
    <>
      <Menu placement="bottom-end">
        <MenuButton aria-label="your actions" as={iconButton} variant="unstyled" isRound />
        <MenuList overflowX="clip" bg={bg} boxShadow="0px 0px 10px 2px rgba(117,117,117,0.69)">
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
          <MenuItem icon={<Setting2 />} onClick={onClickSettings} bg={bg} color={color}>
            settings
          </MenuItem>
          <MenuItem
            onClick={toggleColorMode}
            icon={colorMode === 'light' ? <Moon variant="Bold" /> : <Sun1 variant="Bold" />}
            closeOnSelect={false}
            bg={bg}
            color={color}
          >
            toggle theme
          </MenuItem>
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
      </Menu>
    </>
  );
};
export default UserMenu;
