import { MoreHorizontal } from 'react-feather';

import { LinkIcon, NotAllowedIcon } from '@chakra-ui/icons';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Portal,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';

import { VolumeMute } from 'iconsax-react';

const ProfileActions = () => {
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.900');

  const handleCopyLinkClick = () => {
    // Get the current page's URL
    const currentUrl = window.location.href;
    // Copy the URL to the clipboard
    navigator.clipboard.writeText(currentUrl).then(
      () => {
        console.log('URL copied to clipboard!');
      },
      (err) => {
        console.error('Failed to copy URL: ', err);
      },
    );
  };

  return (
    <>
      <Menu placement="bottom-start">
        <Stack onClick={(e) => e.preventDefault()}>
          <MenuButton
            as={IconButton}
            icon={<MoreHorizontal />}
            aria-label="more"
            variant="unstyled"
            h="15px"
            _hover={{ color: 'spotify.green' }}
            _active={{ boxShadow: 'none' }}
            _focus={{ boxShadow: 'none' }}
            pl={['14px', '10px']}
          />
        </Stack>
        <Portal>
          <MenuList bg={bg}>
            <MenuItem
              icon={<LinkIcon boxSize="18px" />}
              bg={bg}
              color={color}
              _hover={{ color: 'grey' }}
              onClick={handleCopyLinkClick}
            >
              copy link
            </MenuItem>

            <MenuItem
              icon={<VolumeMute size="18px" />}
              bg={bg}
              color={color}
              _hover={{ color: 'red' }}
            >
              mute user
            </MenuItem>
            <MenuItem
              icon={<NotAllowedIcon boxSize="18px" />}
              bg={bg}
              color={color}
              _hover={{ color: 'red' }}
            >
              block user
            </MenuItem>
          </MenuList>
        </Portal>
      </Menu>
    </>
  );
};

export default ProfileActions;
