import { useRef } from 'react';
// import { SketchPicker } from 'react-color';

import { Box } from '@chakra-ui/react';

import { motion } from 'framer-motion';

const DraggablePicker = () => {
  const constraintsRef = useRef(null);
  return (
    <Box ref={constraintsRef} pos="absolute" h="100%" w="100%">
      

      {/* <SketchPicker /> */}
    </Box>
  );
};

export default DraggablePicker;
