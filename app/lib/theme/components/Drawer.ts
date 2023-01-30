import { drawerAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, cssVar, defineStyle } from '@chakra-ui/styled-system';
import { mode } from '@chakra-ui/theme-tools';

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(parts.keys);

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
  backdropFilter: 'blur(14px)',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  transition: 'all .2s',
  zIndex: 'modal',
}));

const desktop = defineStyle({
  dialog: { backdropFilter: 'blur(25px)', zIndex: 'modal' },
  overlay: { backdropFilter: 'blur(25px)', zIndex: 'overlay' },
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
    _dark: {
      [$bg.variable]: mode('music.900', `music.50`)(props),
      [$bs.variable]: mode('music.900', `music.50`)(props),
    },
    bg: $bg.reference,
    boxShadow: 'none',
    color: 'white',
    maxH: '100vh',
    zIndex: 'modal',
    [$bs.variable]: mode('music.900', `music.50`)(props),
    [$bg.variable]: mode('music.900', `music.50`)(props),
  };
});

const body = defineStyle({
  color: 'white',
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

export const Drawer = defineMultiStyleConfig({ baseStyle, variants });
