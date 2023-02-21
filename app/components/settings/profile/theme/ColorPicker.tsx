import { type Dispatch, type SetStateAction } from 'react';
import { SketchPicker, type ColorResult } from 'react-color';

import { Box, HStack, Text, Drawer, DrawerBody, DrawerContent } from '@chakra-ui/react';

import useIsMobile from '~/hooks/useIsMobile';

interface ColorPickerProps {
  bgCol: string;
  gradient?: string;
  index: number;
  onChange: (col: ColorResult, property: string) => void;
  picker: number;
  setPicker: Dispatch<SetStateAction<number>>;
  themeProp: string;
  title: string;
}

const ColorPicker = ({
  bgCol,
  gradient,
  index,
  onChange,
  picker,
  setPicker,
  themeProp,
  title,
}: ColorPickerProps) => {
  const isSmallScreen = useIsMobile();
  const onToggle = () => {
    if (picker === index) {
      setPicker(-1);
    } else {
      setPicker(index);
    }
  };
  return (
    <Box>
      <HStack cursor="pointer" onClick={onToggle}>
        <Box p="1px" bg={bgCol} bgGradient={gradient} boxSize="20px" />
        <Text>{title}</Text>
      </HStack>
      {isSmallScreen ? (
        <Drawer
          isOpen={picker === index}
          placement="bottom"
          onClose={() => setPicker(-1)}
          variant="colorPicker"
          trapFocus={false}
        >
          <DrawerContent w="220px">
            <DrawerBody>
              <SketchPicker color={bgCol} onChange={(col) => onChange(col, themeProp)} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      ) : null}
    </Box>
  );
};

export default ColorPicker;

ColorPicker.displayname = 'Color Picker';
