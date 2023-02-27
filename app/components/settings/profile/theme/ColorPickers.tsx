import { type Dispatch, type PointerEvent, type SetStateAction, useState, useEffect } from 'react';
import { useRef } from 'react';
import { SketchPicker, type ColorResult } from 'react-color';
import { Move, X } from 'react-feather';

import { Box, Collapse, Flex, IconButton, SimpleGrid, useColorMode } from '@chakra-ui/react';

import type { Theme } from '@prisma/client';
import { motion, useDragControls } from 'framer-motion';

import ColorPicker from './ColorPicker';

type ColorPickersProps = {
  picker: number;
  setPicker: Dispatch<SetStateAction<number>>;
  setShowSave: Dispatch<SetStateAction<boolean>>;
  setTheme: Dispatch<SetStateAction<Theme>>;
  theme: Theme;
};

const ColorPickers = ({ picker, setPicker, setShowSave, setTheme, theme }: ColorPickersProps) => {
  const [mouseIn, setMouseIn] = useState(false);
  const { colorMode } = useColorMode();
  const onChange = (col: ColorResult, property: string) => {
    setTheme((prevTheme) => ({ ...prevTheme, [property]: col.hex }));
    setShowSave(true);
  };
  const constraintRef = useRef(null);
  const controls = useDragControls();
  const startDrag = (e: PointerEvent<HTMLDivElement>) => {
    controls.start(e, { snapToCursor: false });
    setMouseIn(true);
  };
  const dontDrag = () => {
    setMouseIn(false);
  };
  const colorPickers =
    colorMode === 'dark'
      ? [
          {
            bgCol: theme.backgroundDark,
            gradient: theme.gradient
              ? `linear(to-t, #090808 1%, ${theme.backgroundDark} 80%)`
              : undefined,
            onChange: (col: ColorResult) => onChange(col, 'backgroundDark'),
            themeProp: 'backgroundDark',
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
            bgCol: theme.backgroundLight,
            gradient: theme.gradient
              ? `linear(to-t, #EEE6E2 1%, ${theme.backgroundLight} 80%)`
              : undefined,
            onChange: (col: ColorResult) => onChange(col, 'backgroundLight'),
            themeProp: 'backgroundLight',
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

  useEffect(() => {
    if (picker >= 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [picker]);

  return (
    <Box ref={constraintRef} h="100%" w="100%" zIndex={99999}>
      <SimpleGrid columns={2} p={[1, 0]} w="100%">
        {colorPickers.map((colorPicker, i) => (
          <Box key={i}>
            <ColorPicker setPicker={setPicker} picker={picker} index={i} {...colorPicker} />
          </Box>
        ))}
      </SimpleGrid>
      <Box zIndex={99999} boxSize="30px" w="222px">
        <motion.div
          drag={mouseIn}
          dragConstraints={constraintRef}
          dragControls={controls}
          dragListener={false}
          dragElastic={1}
          whileDrag={{ scale: 1.02 }}
        >
          <Collapse in={picker >= 0}>
            {picker >= 0 && (
              <>
                <Flex
                  aria-label="color picker controls"
                  onPointerDown={startDrag}
                  onPointerUp={dontDrag}
                  style={{ touchAction: 'none' }}
                  boxSize="30px"
                  bg="#fff"
                >
                  <IconButton
                    aria-label="move"
                    icon={<Move />}
                    bg="#fff"
                    color="#161616"
                    _hover={{}}
                    _active={{}}
                  />
                  <IconButton
                    aria-label="close"
                    icon={<X />}
                    onClick={() => {
                      setPicker(-1);
                    }}
                    onMouseDown={dontDrag}
                    bg="#fff"
                    color="#161616"
                    _hover={{}}
                    _active={{}}
                  />
                </Flex>
                <Box onPointerDown={dontDrag} w="225px" h="178px">
                  <SketchPicker
                    color={colorPickers[picker].bgCol}
                    onChange={(col) => {
                      onChange(col, colorPickers[picker].themeProp);
                    }}
                  />
                </Box>
              </>
            )}
          </Collapse>
        </motion.div>
      </Box>
    </Box>
  );
};

export default ColorPickers;

ColorPickers.displayName = 'Color Picker';
