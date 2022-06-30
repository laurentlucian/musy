import type { TooltipProps } from '@chakra-ui/react';
import { Tooltip as ChakraTooltip } from '@chakra-ui/react';
import { forwardRef, useColorModeValue } from '@chakra-ui/system';

const Tooltip = forwardRef<TooltipProps, 'div'>(({ children, ...props }, ref) => {
  const bg = useColorModeValue('music.50', 'music.900');
  const color = useColorModeValue('music.900', 'music.50');

  return (
    <ChakraTooltip ref={ref} bg={bg} color={color} fontSize="12px" {...props}>
      {children}
    </ChakraTooltip>
  );
});

export default Tooltip;
