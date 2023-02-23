import type { Dispatch, SetStateAction } from 'react';
import type { ColorResult } from 'react-color';
import { SketchPicker } from 'react-color';

import { Box, Collapse, SimpleGrid, useColorMode } from '@chakra-ui/react';

import type { Theme } from '@prisma/client';

import useIsMobile from '~/hooks/useIsMobile';

import ColorPicker from './ColorPicker';

const ColorPickers = ({
  picker,
  setPicker,
  setShowSave,
  setTheme,
  theme,
}: {
  picker: number;
  setPicker: Dispatch<SetStateAction<number>>;
  setShowSave: Dispatch<SetStateAction<boolean>>;
  setTheme: Dispatch<SetStateAction<Theme>>;
  theme: Theme;
}) => {
  const { colorMode } = useColorMode();
  const isSmallScreen = useIsMobile();
  const onChange = (col: ColorResult, property: string) => {
    setTheme((prevTheme) => ({ ...prevTheme, [property]: col.hex }));
    setShowSave(true);
  };
  const colorPickers =
    colorMode === 'dark'
      ? [
          {
            bgCol: theme.gradient ? theme.gradientColorDark : theme.backgroundDark,
            gradient: theme.gradient
              ? `linear(to-t, #090808 1%, ${theme.gradientColorDark} 80%)`
              : undefined,
            onChange: (col: ColorResult) =>
              onChange(col, theme.gradient ? 'gradientColorDark' : 'backgroundDark'),
            themeProp: theme.gradient ? 'gradientColorDark' : 'backgroundDark',
            title: 'background',
          },
          {
            bgCol: theme.playerColorDark,
            onChange: (col: ColorResult) => onChange(col, 'playerColorDark'),
            themeProp: 'playerColorDark',
            title: 'player',
          },
          {
            bgCol: theme.mainTextDark,
            onChange: (col: ColorResult) => onChange(col, 'mainTextDark'),
            themeProp: 'mainTextDark',
            title: 'player main',
          },
          {
            bgCol: theme.subTextDark,
            onChange: (col: ColorResult) => onChange(col, 'subTextDark'),
            themeProp: 'subTextDark',
            title: 'player sub',
          },
          {
            bgCol: '#fff0',
            onChange: () => {},
            themeProp: '',
            title: '',
          },
        ]
      : [
          {
            bgCol: theme.gradient ? theme.gradientColorLight : theme.backgroundLight,
            gradient: theme.gradient
              ? `linear(to-t, #EEE6E2 1%, ${theme.gradientColorLight} 80%)`
              : undefined,
            onChange: (col: ColorResult) =>
              onChange(col, theme.gradient ? 'gradientColorLight' : 'backgroundLight'),
            themeProp: theme.gradient ? 'gradientColorLight' : 'backgroundLight',
            title: 'background',
          },
          {
            bgCol: theme.playerColorLight,
            onChange: (col: ColorResult) => onChange(col, 'playerColorLight'),
            themeProp: 'playerColorLight',
            title: 'player',
          },
          {
            bgCol: theme.mainTextLight,
            onChange: (col: ColorResult) => onChange(col, 'mainTextLight'),
            themeProp: 'mainTextLight',
            title: 'player main',
          },
          {
            bgCol: theme.subTextLight,
            onChange: (col: ColorResult) => onChange(col, 'subTextLight'),
            themeProp: 'subTextLight',
            title: 'player sub',
          },
          {
            bgCol: '#fff0',
            onChange: () => {},
            themeProp: '',
            title: '',
          },
        ];

  return (
    <SimpleGrid columns={2} p={[1, 0]}>
      {colorPickers.map((colorPicker, i) => (
        <Box key={i}>
          <ColorPicker setPicker={setPicker} picker={picker} index={i} {...colorPicker} />
        </Box>
      ))}
      <Collapse in={picker >= 0}>
        {picker >= 0 && !isSmallScreen && (
          <SketchPicker
            color={colorPickers[picker].bgCol}
            onChange={(col) => onChange(col, colorPickers[picker].themeProp)}
          />
        )}
      </Collapse>
    </SimpleGrid>
  );
};

export default ColorPickers;
