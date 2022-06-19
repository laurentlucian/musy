import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import type { GlobalStyleProps } from '@chakra-ui/theme-tools';

import { Button } from './components/Button';
import { Input } from './components/Input';

export const theme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: 'light',
  },
  fonts: {
    body: 'Roboto Mono, sans-serif',
    heading: 'Roboto Mono, serif',
  },
  styles: {
    global: (props: GlobalStyleProps) => ({
      body: {
        fontFamily: 'body',
        color: mode('#161616', '#EEE6E2')(props),
        bg: mode('#EEE6E2', '#050404')(props),
        lineHeight: 'base',
      },
    }),
  },
  components: {
    Button,
    Input,
    FormLabel: {
      baseStyle: { mb: 0 },
    },
    FormError: {
      parts: ['text', 'icon'],
      baseStyle: { text: { mt: 1 } },
    },
  },
});
