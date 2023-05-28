import { MoreHorizontal } from 'react-feather';

import {
  Menu,
  MenuButton,
  MenuList,
  IconButton,
  Portal,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';

import CopyLink from './CopyLink';

const ProfileActions = () => {
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('musy.200', 'musy.900');

  return (
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
          <CopyLink color={color} bg={bg} />
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default ProfileActions;
