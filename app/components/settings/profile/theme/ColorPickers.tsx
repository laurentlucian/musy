import type { Dispatch, SetStateAction } from 'react';
import type { ColorResult } from 'react-color';

import { Box, SimpleGrid, useColorMode } from '@chakra-ui/react';

import type { Theme } from '@prisma/client';

import ColorPicker from './ColorPicker';

const ColorPickers = ({
  picker,
  setPicker,
  setShowSave,
  setTheme,
  theme,
}: {
  picker?: number;
  setPicker: Dispatch<SetStateAction<number | undefined>>;
  setShowSave: Dispatch<SetStateAction<boolean>>;
  setTheme: Dispatch<SetStateAction<Theme>>;
  theme: Theme;
}) => {
  const { colorMode } = useColorMode();
  const onChange = (col: ColorResult, property: string) => {
    setTheme((prevTheme) => ({ ...prevTheme, [property]: col.hex }));
    setShowSave(true);
  };
  const colorPickers = [
    {
      bgCol: colorMode === 'dark' ? theme.gradientColorDark : theme.gradientColorLight,
      index: colorMode === 'dark' ? 0 : 1,
      onChange: (col: ColorResult) =>
        onChange(col, 'gradientColor' + (colorMode === 'dark' ? 'Dark' : 'Light')),
      picker,
      setPicker,
      themeProp: 'gradientColor' + (colorMode === 'dark' ? 'Dark' : 'Light'),
      title: 'Gradient',
    },
    {
      bgCol: colorMode === 'dark' ? theme.playerColorDark : theme.playerColorLight,
      index: colorMode === 'dark' ? 2 : 3,
      onChange: (col: ColorResult) =>
        onChange(col, 'playerColor' + (colorMode === 'dark' ? 'Dark' : 'Light')),
      picker,
      setPicker,
      themeProp: 'playerColor' + (colorMode === 'dark' ? 'Dark' : 'Light'),
      title: 'Player',
    },
    {
      bgCol: colorMode === 'dark' ? theme.mainTextDark : theme.mainTextLight,
      index: colorMode === 'dark' ? 4 : 5,
      onChange: (col: ColorResult) =>
        onChange(col, 'mainText' + (colorMode === 'dark' ? 'Dark' : 'Light')),
      picker,
      setPicker,
      themeProp: 'mainText' + (colorMode === 'dark' ? 'Dark' : 'Light'),
      title: 'Player Main',
    },
    {
      bgCol: colorMode === 'dark' ? theme.subTextDark : theme.subTextLight,
      index: colorMode === 'dark' ? 6 : 7,
      onChange: (col: ColorResult) =>
        onChange(col, 'subText' + (colorMode === 'dark' ? 'Dark' : 'Light')),
      picker,
      setPicker,
      themeProp: 'subText' + (colorMode === 'dark' ? 'Dark' : 'Light'),
      title: 'Player Sub',
    },
  ];

  return (
    <SimpleGrid columns={2} spacing={1}>
      {colorPickers.map((colorPicker) => (
        <Box key={colorPicker.index}>
          <ColorPicker
            bgCol={colorPicker.bgCol}
            onChange={colorPicker.onChange}
            setPicker={colorPicker.setPicker}
            picker={colorPicker.picker}
            index={colorPicker.index}
            title={colorPicker.title}
            themeProp={colorPicker.themeProp}
          />
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default ColorPickers;
