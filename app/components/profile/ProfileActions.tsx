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

import { BlockUser } from './profileActions/BlockUser';
import CopyLink from './profileActions/CopyLink';
import MuteUser from './profileActions/MuteUser';
import RemoveFriend from './profileActions/RemoveFriend';

type ProfileActionsTypes = {
  block: boolean;
  blockId: string;
  mute: boolean;
  muteId: string;
};

const ProfileActions = ({ block, blockId, mute, muteId }: ProfileActionsTypes) => {
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
            <RemoveFriend />
            <MuteUser color={color} bg={bg} mute={mute} muteId={muteId} />
            <BlockUser header={false} block={block} blockId={blockId} />
          </MenuList>
        </Portal>
      </Menu>
    </>
  );
};

export default ProfileActions;
