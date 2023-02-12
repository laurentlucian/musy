import { extendTheme } from '@chakra-ui/react';
import type { GlobalStyleProps } from '@chakra-ui/theme-tools';
import { mode } from '@chakra-ui/theme-tools';

import { Avatar } from './components/Avatar';
import { Button } from './components/Button';
import { Drawer } from './components/Drawer';
import Input from './components/Input';
import { Menu } from './components/Menu';
import { Modal } from './components/Modal';
import colors from './foundations/colors';

// const isFunction = (value: any): value is Function => typeof value === 'function';
// function runIfFn<T, U>(valueOrFn: T | ((...fnArgs: U[]) => T), ...args: U[]): T {
//   return isFunction(valueOrFn) ? valueOrFn(...args) : valueOrFn;
// }

const styles = {
  global: (props: GlobalStyleProps) => ({
    '*::-webkit-scrollbar': {
      bg: 'transparent',
      h: '2px',
      w: '3px',
    },
    '*::-webkit-scrollbar-thumb': {
      bg: mode('#050404', '#f5f5f5')(props),
    },
    '*::-webkit-scrollbar-track': {
      bg: 'transparent',
    },
    body: {
      WebkitTapHighlightColor: '#0000 !important',
      bg: mode('#EEE6E2', '#050404')(props), //<------------------------()
      bgColor: mode('#EEE6E2', '#050404')(props), // but all other components do
      color: mode('#161616', '#EEE6E2')(props), // these do not swap when mode switches
      lineHeight: 'base',
      userSelect: 'none !important',
    },
  }),
};

export const theme = extendTheme({
  colors,
  components: {
    Avatar,
    Button,
    Drawer,
    Input,
    Menu,
    Modal,
  },
  config: {
    cssVarPrefix: 'musy',
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  fonts: {
    body: 'Montserrat, Poppins, Roboto Mono, sans-serif',
    heading: 'Montserrat, Poppins, Roboto Mono, serif',
  },
  styles,
});
