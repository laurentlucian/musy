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
  Portal,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import { Send2 } from 'iconsax-react';
import { MoreHorizontal } from 'react-feather';

const QuickActions = () => {
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.900');
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
        />
      </Stack>
      <Portal>
        <MenuList bg={bg} boxShadow="0px 0px 10px 2px rgba(117,117,117,0.69)">
          <MenuItem icon={<Send2 />} bg={bg} color={color}>
            queue
          </MenuItem>
          <MenuItem icon={<Send2 variant="Bold" />} bg={bg} color={color}>
            recommend
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default QuickActions;
