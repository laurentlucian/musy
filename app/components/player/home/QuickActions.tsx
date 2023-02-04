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
  forwardRef,
  type IconButtonProps,
  Stack,
} from '@chakra-ui/react';
import { Send2 } from 'iconsax-react';
import { MoreHorizontal } from 'react-feather';

const QuickActions = () => {
  return (
    <Menu placement="bottom-start">
      <Stack onClick={(e) => e.preventDefault()}>
        <MenuButton
          as={IconButton}
          icon={<MoreHorizontal />}
          aria-label="more"
          variant="unstyled"
          h="15px"
          border="solid"
          _hover={{ color: 'spotify.green' }}
        />
      </Stack>
      <Portal>
        <MenuList>
          <MenuItem icon={<Send2 />}>queue</MenuItem>
          <MenuItem icon={<Send2 variant="Bold" />}>recommend</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default QuickActions;
