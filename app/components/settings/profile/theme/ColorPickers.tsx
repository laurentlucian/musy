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
            bgCol: theme.gradientColorDark,
            onChange: (col: ColorResult) => onChange(col, 'gradientColorDark'),
            themeProp: 'gradientColorDark',
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
            themeProp: 'subTextLight',
            title: 'player sub',
          },
        ]
      : [
          {
            bgCol: theme.gradientColorLight,
            onChange: (col: ColorResult) => onChange(col, 'gradientColorLight'),
            themeProp: 'gradientColorLight',
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
        ];

  return (
    <SimpleGrid columns={2} p={[1, 0]}>
      {colorPickers.map((colorPicker, i) => (
        <Box key={i}>
          <ColorPicker
            bgCol={colorPicker.bgCol}
            onChange={colorPicker.onChange}
            setPicker={setPicker}
            picker={picker}
            index={i}
            title={colorPicker.title}
            themeProp={colorPicker.themeProp}
          />
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
