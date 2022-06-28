import type { TooltipProps } from '@chakra-ui/react';
import { Tooltip as ChakraTooltip } from '@chakra-ui/react';
import { forwardRef } from '@chakra-ui/system';

const Tooltip = forwardRef<TooltipProps, 'div'>(({ children, ...props }, ref) => {
  return (
    <ChakraTooltip
      ref={ref}
      bg="black"
      border="1px solid white"
      color="white"
      fontSize="12px"
      {...props}
    >
      {children}
    </ChakraTooltip>
  );
});

export default Tooltip;
