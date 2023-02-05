import { useState } from 'react';
import { MoreHorizontal } from 'react-feather';

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Portal,
  Stack,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';

import { Minus, Send2 } from 'iconsax-react';

import SendModal from './SendModal';
import { useMobileDrawerActions } from '~/hooks/useMobileDrawer';

const QuickActions = ({
  id,
  name,
  que,
  recommend,
  currentUserId,
}: {
  id: string;
  name: string;
  que?: string;
  recommend?: string;
  currentUserId: string | undefined;
}) => {
  const [title, setTitle] = useState('');
  const [sendList, setSendList] = useState<boolean>();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.900');
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { showButton, hideButton } = useMobileDrawerActions();
  const onClickMenuItem = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    onOpen();
    hideButton();
  };
  const onCloseSendModal = () => {
    onClose();
    showButton();
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
          />
        </Stack>
        <Portal>
          <MenuList bg={bg} boxShadow="0px 0px 10px 2px rgba(117,117,117,0.69)">
            <MenuItem icon={<Minus />}>open {name}'s profile</MenuItem>
            {que === 'off' ? (
              <MenuItem pointerEvents="none" icon={<Send2 />} bg={bg} color={color}>
                queue is off
              </MenuItem>
            ) : (
              <MenuItem
                icon={<Send2 />}
                bg={bg}
                color={color}
                onClick={(e) => {
                  onClickMenuItem(e);
                  setTitle(`queue`);
                  setSendList(true);
                }}
              >
                queue to {name}
              </MenuItem>
            )}
            {recommend === 'off' ? (
              <MenuItem pointerEvents="none" icon={<Send2 variant="Bold" />} bg={bg} color={color}>
                recommendation is off
              </MenuItem>
            ) : (
              <MenuItem
                icon={<Send2 variant="Bold" />}
                bg={bg}
                color={color}
                onClick={(e) => {
                  onClickMenuItem(e);
                  setTitle(`recommend`);
                  setSendList(false);
                }}
              >
                recommend to {name}
              </MenuItem>
            )}
          </MenuList>
        </Portal>
      </Menu>
      <SendModal
        isOpen={isOpen}
        onClose={onCloseSendModal}
        id={id}
        name={name}
        title={title}
        setTitle={setTitle}
        sendList={sendList}
        setSendList={setSendList}
        currentUserId={currentUserId}
      />
    </>
  );
};

export default QuickActions;
