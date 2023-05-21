import { menuAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(
  menuAnatomy.keys,
);

const baseStyle = definePartsStyle((props) => ({
  button: {
    _hover: {
      bg: mode('musy.800', 'musy.100')(props),
      color: mode('musy.100', `music.800`)(props),
    },
    // menu button; not working because it's being used as IconButton
    bg: mode('musy.800', 'musy.100')(props),
    fontWeight: 'bold',
  },
  item: {
    _active: { boxShadow: 'none' },
    _hover: { boxShadow: 'none', color: 'spotify.green' },
    bg: mode('musy.800', 'musy.100')(props),
    color: mode('musy.100', `music.800`)(props),
    // menu item
    fontSize: '14px',
  },
  list: {
    // menu list
    bg: mode('musy.800', 'musy.100')(props),
    borderColor: 'transparent',
    borderRadius: 5,
    color: mode('musy.100', 'musy.800')(props),
    maxW: 'max-content',
    minW: '200px',
  },
}));

export const Menu = defineMultiStyleConfig({ baseStyle });
