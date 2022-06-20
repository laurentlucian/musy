import { mode, transparentize } from '@chakra-ui/theme-tools';
import type { SystemStyleObject, SystemStyleFunction } from '@chakra-ui/theme-tools';

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

const variantMusic: SystemStyleFunction = (props) => {
  const { colorScheme: c } = props;

  const { bg = `${c}.500`, color = 'white', hoverBg = `${c}.600`, activeBg = `${c}.700` } = accessibleColorMap[c] ?? {};

  const background = mode(`${c}.200`, bg)(props);

  return {
    bg: background,
    color: mode(`gray.800`, color)(props),
    _hover: {
      bg: mode(`${c}.300`, hoverBg)(props),
      _disabled: {
        bg: background,
      },
    },
    _active: { bg: mode(`${c}.400`, activeBg)(props) },
  };
};

export default {
  baseStyle: {
    borderRadius: 'sm',
  },
  defaultProps: {
    colorScheme: 'music',
    size: 'sm',
    variant: 'music',
  },
  variants: {
    music: variantMusic,
  },
};
