import { type Dispatch, type SetStateAction, type RefObject, type MouseEvent } from 'react';
import { SketchPicker, type ColorResult } from 'react-color';

import { Box, Collapse, HStack, Text } from '@chakra-ui/react';

interface ColorPickerProps {
  bgCol: string;
  index: number;
  onChange: (col: ColorResult) => void;
  picker: number | undefined;
  ref: RefObject<HTMLDivElement>;
  setPicker: Dispatch<SetStateAction<number | undefined>>;
  title: string;
}

const ColorPicker = ({
  bgCol,
  index,
  onChange,
  picker,
  ref,
  setPicker,
  title,
}: ColorPickerProps) => {
  const handleClick = (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
    e.stopPropagation();
    setPicker(index);
    const delayScroll = setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 0);
    return () => clearTimeout(delayScroll);
  };

  return (
    <>
      <HStack>
        <Box p="1px" bg={bgCol} boxSize="20px" onClick={(e) => handleClick(e)} />
        <Text>{title}</Text>
      </HStack>
      <Collapse in={picker === index}>
        <div ref={ref}>
          <SketchPicker color={bgCol} onChange={(col) => onChange(col)} />
        </div>
      </Collapse>
    </>
  );
};

export default ColorPicker;

ColorPicker.displayname = "Color Picker"