import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { avatarAnatomy } from '@chakra-ui/anatomy';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  avatarAnatomy.keys,
);

const baseStyle = definePartsStyle((props) => ({
  // define the part you're going to style
  badge: {
    bg: 'gray.500',
  },
  container: {
    borderRadius: 'full',
    border: mode('3px solid #E7DFD966', '3px solid #10101066')(props),
    boxShadow: mode('0 0 10px #E7DFD966', '0 0 10px #10101066')(props),
  },
  excessLabel: {
    bg: 'gray.800',
    color: 'white',
    borderRadius: 'full',
  },
}));

export const Avatar = defineMultiStyleConfig({ baseStyle });
