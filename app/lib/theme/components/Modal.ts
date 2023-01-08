import { createMultiStyleConfigHelpers, cssVar, defineStyle } from '@chakra-ui/styled-system';
import { modalAnatomy as parts } from '@chakra-ui/anatomy';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys);

const isFunction = (value: any): value is Function => typeof value === 'function';

function runIfFn<T, U>(valueOrFn: T | ((...fnArgs: U[]) => T), ...args: U[]): T {
  return isFunction(valueOrFn) ? valueOrFn(...args) : valueOrFn;
}

const $bg = cssVar('modal-bg');
const $bs = cssVar('modal-box-shadow');

const baseStyleOverlay = defineStyle((props) => ({
  // backdropFilter: 'blur(14px)',
  transition: 'all .2s',
  zIndex: 'modal',
}));

const baseStyleDialogContainer = defineStyle((props) => ({
  transition: 'all .2s',
  display: 'flex',
  zIndex: 'modal',
  justifyContent: 'center',
}));

const baseStyleDialog = defineStyle((props) => {
  const { isFullHeight } = props;

  return {
    ...(isFullHeight && { height: '100vh' }),
    zIndex: 'modal',
    maxH: '100vh',
    [$bg.variable]: mode(`#E4DBD5`, '#111111')(props),
    // [$bs.variable]: mode(`music.100`, 'music.800')(props),
    _dark: {
      [$bg.variable]: mode(`#E4DBD5`, '#111111')(props),
      // [$bs.variable]: mode(`music.100`, 'music.800')(props),
    },
    bg: $bg.reference,
    boxShadow: 'none',
  };
});

const body = defineStyle({
  p: '0',
  flex: '1',
  overflow: 'auto',
});

const baseStyle = definePartsStyle((props) => ({
  overlay: runIfFn(baseStyleOverlay, props),
  dialogContainer: runIfFn(baseStyleDialogContainer, props),
  dialog: runIfFn(baseStyleDialog, props),
  body,
}));

export const Modal = defineMultiStyleConfig({
  baseStyle,
});
