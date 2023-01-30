import type { GlobalStyleProps } from '@chakra-ui/theme-tools';
import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

import { Button } from './components/Button';
import { Drawer } from './components/Drawer';
import { Avatar } from './components/Avatar';
import { Modal } from './components/Modal';
import { Menu } from './components/Menu';

import colors from './foundations/colors';
import Input from './components/Input';

// const isFunction = (value: any): value is Function => typeof value === 'function';
// function runIfFn<T, U>(valueOrFn: T | ((...fnArgs: U[]) => T), ...args: U[]): T {
//   return isFunction(valueOrFn) ? valueOrFn(...args) : valueOrFn;
// }

const styles = {
  global: (props: GlobalStyleProps) => ({
    body: {
      color: mode('#161616', '#EEE6E2')(props), // these do not swap when mode switches
      bgColor: mode('#EEE6E2', '#050404')(props), // but all other components do
      bg: mode('#EEE6E2', '#050404')(props), //<------------------------()
      lineHeight: 'base',
      WebkitTapHighlightColor: '#0000 !important',
      userSelect: 'none !important',
    },
    '*::-webkit-scrollbar-track': {
      bg: mode('#EEE6E2', '#050404')(props), // these too
    },
    '*::-webkit-scrollbar-thumb': {
      bg: mode('#050404', '#f5f5f5')(props), // <---
    },
    '*::-webkit-scrollbar': {
      w: '3px',
      h: '2px',
      bg: mode('#050404', '#f5f5f5')(props), // <---
    },
  }),
};

export const theme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: 'dark',
    cssVarPrefix: 'musy',
  },
  styles,
  fonts: {
    body: 'Montserrat, Poppins, Roboto Mono, sans-serif',
    heading: 'Montserrat, Poppins, Roboto Mono, serif',
  },
  components: {
    Button,
    Input,
    Drawer,
    Avatar,
    Modal,
    Menu,
  },
  colors,
});
