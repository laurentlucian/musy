import { MoreHorizontal } from 'react-feather';

import { LinkIcon } from '@chakra-ui/icons';
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

import { BlockUser } from './profileActions/BlockUser';
import CopyLink from './profileActions/CopyLink';

type ProfileActionsTypes = {
  block: boolean;
  blockId: string;
};

const ProfileActions = ({ block, blockId }: ProfileActionsTypes) => {
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.900');

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
            <CopyLink color={color} bg={bg} />
            <MenuItem
              icon={<VolumeMute size="18px" />}
              bg={bg}
              color={color}
              _hover={{ color: 'red' }}
            >
              mute user
            </MenuItem>
            <BlockUser color={color} bg={bg} block={block} blockId={blockId} />
          </MenuList>
        </Portal>
      </Menu>
    </>
  );
};

export default ProfileActions;
