import { mode, transparentize } from '@chakra-ui/theme-tools';
import type { SystemStyleFunction } from '@chakra-ui/theme-tools';
import { defineStyle, defineStyleConfig } from '@chakra-ui/styled-system';

type AccessibleColor = {
  bg?: string;
  color?: string;
  hoverBg?: string;
  activeBg?: string;
};

/** Accessible color overrides for less accessible colors. */
const accessibleColorMap: { [key: string]: AccessibleColor } = {
  yellow: {
    bg: 'yellow.400',
    color: 'black',
    hoverBg: 'yellow.500',
    activeBg: 'yellow.600',
  },
  cyan: {
    bg: 'cyan.400',
    color: 'black',
    hoverBg: 'cyan.500',
    activeBg: 'cyan.600',
  },
};

const baseStyle = defineStyle((props) => ({
  color: mode('music.200', 'music.800')(props),
  borderRadius: 'sm',
}));

const variantMusic: SystemStyleFunction = (props) => {
  const { colorScheme: c } = props;

  const {
    bg = `${c}.500`,
    color = 'white',
    hoverBg = `${c}.600`,
    activeBg = `${c}.700`,
  } = accessibleColorMap[c] ?? {};

  const background = mode(bg, `${c}.100`)(props);

  return {
    bg: background,
    color: mode(color, `gray.800`)(props),
    _hover: {
      bg: mode(hoverBg, `${c}.300`)(props),
      _disabled: {
        bg: background,
      },
    },
    _active: { bg: mode(activeBg, `${c}.400`)(props) },
  };
};

const variantGhost = defineStyle((props) => {
  const { colorScheme: c, theme } = props;

  if (c === 'gray') {
    return {
      color: mode('music.200', 'music.800')(props),
      _hover: {
        bg: mode(`whiteAlpha.200`, `gray.100`)(props),
      },
      _active: { bg: mode(`whiteAlpha.300`, `gray.200`)(props) },
    };
  }

  const darkHoverBg = transparentize(`${c}.200`, 0.12)(theme);
  const darkActiveBg = transparentize(`${c}.200`, 0.24)(theme);

  return {
    color: mode(`music.200`, `music.800`)(props),
    bg: 'transparent',
    _hover: {
      bg: mode(darkHoverBg, `${c}.50`)(props),
    },
    _active: {
      bg: mode(darkActiveBg, `#302f2f`)(props),
    },
  };
});

const login = defineStyle((props) => ({
  h: '39px',
  w: '200px',
  borderRadius: '7px',
  boxShadow: 'none !important',
  userSelect: 'none !important',
  backfaceVisibility: 'none !important',
  color: mode('music.700', 'white')(props),
  bg: mode('music.200', 'music.700')(props),
  WebkitTapHighlightColor: '#0000 !important',
  _active: {
    boxShadow: 'none !important',
    backfaceVisibility: 'none !important',
  },
  _focus: {
    boxShadow: 'none !important',
    backfaceVisibility: 'none !important',
  },
  _hover: { boxShadow: 'none !important', backfaceVisibility: 'none !important' },
}));

const drawer = defineStyle({
  bg: '#00',
  w: '100vw',
  _active: { boxShadow: 'none !important', outline: 'none !important', opacity: '0.69' },
  _focus: { boxShadow: 'none !important', outline: 'none !important', opacity: '0.69' },
  _hover: { boxShadow: 'none !important', outline: 'none !important', opacity: '0.69' },
  boxShadow: 'none !important',
  outline: 'none !important',
});
const searchCircle = defineStyle((props) => ({
  pos: 'fixed',
  borderRadius: 'full',
  bg: mode('music.200', 'music.700')(props),
  color: mode('music.700', 'music.200')(props),
  boxSize: '50px',
  fontSize: '40px',
  fontWeight: 'hairline',

  _active: {
    boxShadow: 'none !important',
    boxSize: '43px',
    backfaceVisibility: 'none !important',
  },
  _focus: {
    boxShadow: 'none !important',
    backfaceVisibility: 'none !important',
  },
  transition: 'width 0.25s ease-out, height 0.25s ease-out, bottom 0.25s ease-in-out',
  _hover: { boxShadow: 'none !important', backfaceVisibility: 'none !important' },
  boxShadow: 'none !important',
  userSelect: 'none !important',
  backfaceVisibility: 'none !important',
  perspective: 1000,
  zIndex: 10000,
  WebkitTapHighlightColor: '#0000 !important',
}));
const close = defineStyle((props) => ({
  pos: 'fixed',
  top: -1,
  right: 1,
  color: mode('music.700', 'white')(props),
  fontSize: '20px',
  fontWeight: 'light',
  _active: {
    boxShadow: 'none !important',
    fontSize: '18px',
    backfaceVisibility: 'none !important',
  },
  _focus: {
    boxShadow: 'none !important',
    backfaceVisibility: 'none !important',
  },
  _hover: { boxShadow: 'none !important', backfaceVisibility: 'none !important' },
  transition: 'font-size 0.25s ease-out',
  boxShadow: 'none !important',
  userSelect: 'none !important',
  backfaceVisibility: 'none !important',
  perspective: 1000,
  zIndex: 10000,
  WebkitTapHighlightColor: '#0000 !important',
}));

export const Button = defineStyleConfig({
  baseStyle,
  variants: {
    music: variantMusic,
    ghost: variantGhost,
    drawer,
    login,
    searchCircle,
    close,
  },
  defaultProps: {
    colorScheme: 'music',
    size: 'sm',
    variant: 'music',
  },
});
