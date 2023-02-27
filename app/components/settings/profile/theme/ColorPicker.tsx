import { type Dispatch, type SetStateAction } from 'react';

import { Box, HStack, Text } from '@chakra-ui/react';

interface ColorPickerProps {
  bgCol: string;
  gradient?: string;
  index: number;
  picker: number;
  setPicker: Dispatch<SetStateAction<number>>;
  title: string;
}

const ColorPicker = ({ bgCol, gradient, index, picker, setPicker, title }: ColorPickerProps) => {
  if (title === '') return null;
  const onToggle = () => {
    if (picker === index) {
      setPicker(-1);
    } else setPicker(index);
  };
  return (
    <HStack cursor="pointer" onClick={onToggle}>
      <Box p="1px" bg={bgCol} bgGradient={gradient} boxSize="20px" />
      <Text>{title}</Text>
    </HStack>
  );
};

export default ColorPicker;

ColorPicker.displayname = 'Color Picker';
