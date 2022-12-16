import { menuAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  menuAnatomy.keys,
);

const baseStyle = definePartsStyle({
  button: {
    // menu button
    bg: 'music',
    fontWeight: 'bold,',
    _hover: {
      bg: 'music',
      color: 'music',
    },
  },
  list: {
    // menu list
    bg: 'music',
    color: 'music',
    minW: '200px',
    ml: 0,
    px: 0,
  },
  item: {
    // menu item
    bg: 'music',
    color: 'music',
  },
});

const variants = {
  test: {
    button: {
      borderLeftRadius: 'full',
      pl: '6',
    },
  },
  roundRight: {
    button: {
      borderRightRadius: 'full',
      pr: '6',
    },
  },
};

export const menuTheme = defineMultiStyleConfig({ variants, baseStyle });
