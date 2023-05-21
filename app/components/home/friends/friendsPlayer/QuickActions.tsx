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
  Image,
} from '@chakra-ui/react';

import { Send2 } from 'iconsax-react';

import SendModal from './SendModal';

const QuickActions = ({
  image,
  name,
  profileId,
  que,
  recommend,
}: {
  image: string;
  name: string;
  profileId: string;
  que?: string;
  recommend?: string;
}) => {
  const [title, setTitle] = useState<'queue' | 'recommend'>('queue');
  const [sendList, setSendList] = useState<boolean>();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('musy.200', 'musy.900');
  const { isOpen, onClose, onOpen } = useDisclosure();
  const onClickMenuItem = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    onOpen();
  };

  return (
    <>
      <Menu placement="bottom-start">
        <Stack onClick={(e) => e.preventDefault()} w="45px">
          <MenuButton
            as={IconButton}
            icon={<MoreHorizontal />}
            aria-label="more"
            variant="unstyled"
            h="15px"
            w="45px"
            _hover={{ color: 'spotify.green' }}
            _active={{ boxShadow: 'none' }}
            _focus={{ boxShadow: 'none' }}
          />
        </Stack>
        <Portal>
          <MenuList bg={bg} boxShadow="0px 0px 10px 2px rgba(117,117,117,0.79)" zIndex={99}>
            {que !== 'off' && (
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
                queue
              </MenuItem>
            )}
            {recommend !== 'off' && (
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
                recommend
              </MenuItem>
            )}
            <MenuItem
              icon={
                <Image boxSize="25px" borderRadius="full" minH="25px" minW="25px" src={image} />
              }
              bg={bg}
              color={color}
            >
              {name}
            </MenuItem>
          </MenuList>
        </Portal>
      </Menu>
      <SendModal
        isOpen={isOpen}
        onClose={onClose}
        profileId={profileId}
        name={name}
        title={title}
        setTitle={setTitle}
        sendList={sendList}
        setSendList={setSendList}
      />
    </>
  );
};

export default QuickActions;
