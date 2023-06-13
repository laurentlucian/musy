import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';

const Waver = (props: BoxProps) => {
  return (
    <Box className="la-line-scale-pulse-out" {...props}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </Box>
  );
};

export default Waver;
