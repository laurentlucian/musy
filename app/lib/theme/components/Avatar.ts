import { avatarAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(
  avatarAnatomy.keys,
);

const baseStyle = definePartsStyle((props) => ({
  // define the part you're going to style
  badge: {
    bg: 'musy.900',
  },
  container: {
    border: mode('3px solid music.200', '3px solid music.900')(props),
    borderRadius: 'full',
  },
  excessLabel: {
    bg: 'musy.900',
    borderRadius: 'full',
    color: 'musy.900',
  },
}));

export const Avatar = defineMultiStyleConfig({ baseStyle });
