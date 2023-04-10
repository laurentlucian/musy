import { modalAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, cssVar, defineStyle } from '@chakra-ui/styled-system';
import { mode } from '@chakra-ui/theme-tools';

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(parts.keys);

const isFunction = (value: any): value is Function => typeof value === 'function';

function runIfFn<T, U>(valueOrFn: T | ((...fnArgs: U[]) => T), ...args: U[]): T {
  return isFunction(valueOrFn) ? valueOrFn(...args) : valueOrFn;
}

const $bg = cssVar('modal-bg');

const baseStyleOverlay = defineStyle((props) => ({
  color: mode(`#E4DBD5`, '#111111')(props),
  transition: 'all .2s',
  zIndex: 'modal',
}));

const baseStyleDialogContainer = defineStyle((props) => ({
  color: mode(`#E4DBD5`, '#111111')(props),
  display: 'flex',
  justifyContent: 'center',
  transition: 'all .2s',
  zIndex: 'modal',
}));

const baseStyleDialog = defineStyle((props) => {
  const { isFullHeight } = props;

  return {
    ...(isFullHeight && { height: '100vh' }),
    bg: $bg.reference,
    boxShadow: 'none',
    maxH: '100vh',
    zIndex: 'modal',
    [$bg.variable]: mode('#111111', `#E4DBD5`)(props),
  };
});

const body = defineStyle({
  flex: '1',
  overflow: 'auto',
  p: '0',
});

const baseStyle = definePartsStyle((props) => ({
  body,
  dialog: runIfFn(baseStyleDialog, props),
  dialogContainer: runIfFn(baseStyleDialogContainer, props),
  overlay: runIfFn(baseStyleOverlay, props),
}));

export const Modal = defineMultiStyleConfig({
  baseStyle,
});
