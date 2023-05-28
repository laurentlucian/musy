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

import { BlockUser } from './BlockUser';
import CopyLink from './CopyLink';
import MuteUser from './MuteUser';
import RemoveFriend from './RemoveFriend';

type ProfileActionsTypes = {
  block: boolean;
  blockId: string;
  mute: boolean;
  muteId: string;
};

const ProfileActions = ({ block, blockId, mute, muteId }: ProfileActionsTypes) => {
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
          <RemoveFriend />
          <MuteUser color={color} bg={bg} mute={mute} muteId={muteId} />
          <BlockUser header={false} block={block} blockId={blockId} />
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default ProfileActions;
