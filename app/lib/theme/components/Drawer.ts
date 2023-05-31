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

const baseStyleOverlay = defineStyle({
  backdropFilter: 'blur(14px)',
  transition: 'all .2s',
  zIndex: 0,
});

const baseStyleDialogContainer = defineStyle({
  backdropFilter: 'blur(14px)',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  transition: 'all .2s',
  zIndex: 0,
});

const desktop = defineStyle({
  dialogContainer: { backdropFilter: 'blur(25px)', zIndex: 'overlay' },
});
const colorPicker = defineStyle({
  dialog: { backdropFilter: 'blur(0px)', zIndex: 'modal' },
  dialogContainer: { backdropFilter: 'blur(0px)' },
  overlay: { backdropFilter: 'blur(0px)', zIndex: 'overlay' },
});
const nested = defineStyle({
  dialog: { backdropFilter: 'blur(14px)', zIndex: 'modal' },
});

const mobileAvatarDrawerDialog = defineStyle({
  backdropFilter: 'blur(14px)',
  borderBottomRadius: '20px',
  zIndex: 'modal',
});
const mobileAvatarDrawer = definePartsStyle({
  dialog: mobileAvatarDrawerDialog,
  dialogContainer: {
    backdropFilter: 'blur(0px)',
    zIndex: 'modal',
  },
  overlay: {
    backdropFilter: 'blur(0px)',
    zIndex: 'overlay',
  },
});
const variants = {
  colorPicker,
  desktop,
  mobileAvatarDrawer,
  nested,
};
const baseStyleDialog = defineStyle((props) => {
  const { isFullHeight } = props;

  return {
    ...(isFullHeight && { height: '100vh' }),
    _dark: {
      [$bg.variable]: mode('musy.900', `music.50`)(props),
      [$bs.variable]: mode('musy.900', `music.50`)(props),
    },
    bg: $bg.reference,
    boxShadow: 'none',
    color: 'white',
    maxH: '100vh',
    zIndex: 0,
    [$bs.variable]: mode('musy.900', `music.50`)(props),
    [$bg.variable]: mode('musy.900', `music.50`)(props),
  };
});
const closeButton = defineStyle({
  boxShadow: 'none !important',
  userSelect: 'none !important',
});
const body = defineStyle({
  color: 'white',
  flex: '1',
  overflow: 'auto',
  p: 0,
});

const baseStyle = definePartsStyle((props) => ({
  body,
  closeButton,
  dialog: runIfFn(baseStyleDialog, props),
  dialogContainer: baseStyleDialogContainer,
  overlay: baseStyleOverlay,
}));

export const Drawer = defineMultiStyleConfig({ baseStyle, variants });
