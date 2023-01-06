import { drawerAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, cssVar, defineStyle } from '@chakra-ui/styled-system';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys);

const isFunction = (value: any): value is Function => typeof value === 'function';

function runIfFn<T, U>(valueOrFn: T | ((...fnArgs: U[]) => T), ...args: U[]): T {
  return isFunction(valueOrFn) ? valueOrFn(...args) : valueOrFn;
}

const $bg = cssVar('drawer-bg');
const $bs = cssVar('drawer-box-shadow');

const baseStyleOverlay = defineStyle((props) => ({
  backdropFilter: 'blur(14px)',
  transition: 'all .2s',
  zIndex: 'overlay',
}));

const baseStyleDialogContainer = defineStyle((props) => ({
  transition: 'all .2s',
  display: 'flex',
  zIndex: 'modal',
  justifyContent: 'center',
  color: 'white',
}));

const desktop = defineStyle({
  overlay: { backdropFilter: 'blur(25px)', zIndex: 'overlay' },
  dialog: { backdropFilter: 'blur(25px)', zIndex: 'modal' },
});
const nested = defineStyle({
  dialog: { backdropFilter: 'blur(14px)', zIndex: 'modal' },
});
const variants = {
  desktop,
  nested,
};
const baseStyleDialog = defineStyle((props) => {
  const { isFullHeight } = props;

  return {
    ...(isFullHeight && { height: '100vh' }),
    zIndex: 'modal',
    maxH: '100vh',
    color: 'white',
    [$bg.variable]: mode(`music.50`, 'music.900')(props),
    [$bs.variable]: mode(`music.50`, 'music.900')(props),
    _dark: {
      [$bg.variable]: mode(`music.50`, 'music.900')(props),
      [$bs.variable]: mode(`music.50`, 'music.900')(props),
    },
    bg: $bg.reference,
    boxShadow: 'none',
  };
});

const body = defineStyle({
  p: '0',
  flex: '1',
  overflow: 'auto',
  color: 'white',
});

const baseStyle = definePartsStyle((props) => ({
  overlay: runIfFn(baseStyleOverlay, props),
  dialogContainer: runIfFn(baseStyleDialogContainer, props),
  dialog: runIfFn(baseStyleDialog, props),
  body,
}));

export const Drawer = defineMultiStyleConfig({ baseStyle, variants });
