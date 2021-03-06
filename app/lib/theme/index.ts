import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import type { GlobalStyleProps } from '@chakra-ui/theme-tools';

import Button from './components/Button';
import Input from './components/Input';
import colors from './foundations/colors';

const global = (props: GlobalStyleProps) => ({
  body: {
    color: mode('#161616', '#EEE6E2')(props),
    bg: mode('#EEE6E2', '#050404')(props),
    lineHeight: 'base',
  },
  '*::-webkit-scrollbar-track': {
    bg: mode('#EEE6E2', '#050404')(props),
  },
  '*::-webkit-scrollbar-thumb': {
    bg: mode('#050404', '#f5f5f5')(props),
  },
  '*::-webkit-scrollbar': {
    w: '3px',
    h: '2px',
    bg: mode('#050404', '#f5f5f5')(props),
  },
});

export const theme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: 'dark',
    cssVarPrefix: 'musy',
  },
  styles: {
    global,
  },
  fonts: {
    body: 'Montserrat, Poppins, Roboto Mono, sans-serif',
    heading: 'Montserrat, Poppins, Roboto Mono, serif',
  },
  components: {
    Button,
    Input,
  },
  colors,
});
