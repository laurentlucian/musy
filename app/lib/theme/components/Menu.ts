import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { menuAnatomy } from '@chakra-ui/anatomy';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  menuAnatomy.keys,
);

const baseStyle = definePartsStyle((props) => ({
  button: {
    // menu button; not working because it's being used as IconButton
    bg: mode('music.800', `music.100`)(props),
    fontWeight: 'bold',
    _hover: {
      bg: mode('music.800', `music.100`)(props),
      color: mode('music.100', `music.800`)(props),
    },
  },
  list: {
    // menu list
    bg: mode('music.800', `music.100`)(props),
    color: mode('music.100', `music.800`)(props),
    minW: '200px',
    maxW: 'max-content',
    borderRadius: 5,
    borderColor: 'transparent',
    // ml: 0,
    // px: 0,
  },
  item: {
    // menu item
    fontSize: '14px',
    bg: mode('music.800', `music.100`)(props),
    color: mode('music.100', `music.800`)(props),
    _hover: { color: 'spotify.green', boxShadow: 'none' },
    _active: { boxShadow: 'none' },
  },
}));

export const Menu = defineMultiStyleConfig({ baseStyle });
