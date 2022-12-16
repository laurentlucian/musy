import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { menuAnatomy } from '@chakra-ui/anatomy';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  menuAnatomy.keys,
);

const baseStyle = definePartsStyle((props) => ({
  button: {
    // menu button
    bg: mode(`music.100`, 'music.800')(props),
    fontWeight: 'bold,',
    _hover: {
      bg: mode(`music.100`, 'music.800')(props),
      color: mode(`music.800`, 'music.  00')(props),
    },
  },
  list: {
    // menu list
    bg: mode(`music.100`, 'music.800')(props),
    color: mode(`music.800`, 'music.100')(props),
    minW: '200px',
    maxW: '200px',
    ml: 0,
    px: 0,
  },
  item: {
    // menu item
    bg: mode(`music.100`, 'music.800')(props),
    color: mode(`music.800`, 'music.100')(props),
  },
}));

export const menuTheme = defineMultiStyleConfig({ baseStyle });
