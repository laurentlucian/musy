import { type Dispatch, type SetStateAction, type RefObject } from 'react';
import { SketchPicker, type ColorResult } from 'react-color';

import { Box, HStack, Text, Drawer, DrawerBody, DrawerContent, Collapse } from '@chakra-ui/react';

import useIsMobile from '~/hooks/useIsMobile';

interface ColorPickerProps {
  bgCol: string;
  index: number;
  onChange: (col: ColorResult, property: string) => void;
  picker: number | undefined;
  ref: RefObject<HTMLDivElement>;
  setPicker: Dispatch<SetStateAction<number | undefined>>;
  themeProp: string;
  title: string;
}

const ColorPicker = ({
  bgCol,
  index,
  onChange,
  picker,
  ref,
  setPicker,
  themeProp,
  title,
}: ColorPickerProps) => {
  const isSmallScreen = useIsMobile();
  const onToggle = () => {
    if (picker === index) {
      setPicker(undefined);
    } else {
      setPicker(index);
    }
  };

  return (
    <>
      <HStack cursor="pointer" onClick={onToggle}>
        <Box p="1px" bg={bgCol} boxSize="20px" />
        <Text>{title}</Text>
      </HStack>
      <Box w="220px">
        {isSmallScreen ? (
          <Drawer
            isOpen={picker === index}
            placement="bottom"
            onClose={() => setPicker(undefined)}
            variant="colorPicker"
            trapFocus={false}
          >
            <DrawerContent w="220px">
              <DrawerBody>
                <div ref={ref}>
                  <SketchPicker color={bgCol} onChange={(col) => onChange(col, themeProp)} />
                </div>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        ) : (
          <Collapse in={picker === index}>
            <Box ref={ref}>
              <SketchPicker color={bgCol} onChange={(col) => onChange(col, themeProp)} />
            </Box>
          </Collapse>
        )}
      </Box>
    </>
  );
};

export default ColorPicker;

ColorPicker.displayname = 'Color Picker';
