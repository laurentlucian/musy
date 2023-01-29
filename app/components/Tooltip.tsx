import type { TooltipProps } from '@chakra-ui/react';
import { Tooltip as ChakraTooltip } from '@chakra-ui/react';
import { forwardRef, useColorModeValue } from '@chakra-ui/system';

const Tooltip = forwardRef<TooltipProps, 'div'>(
  ({ children, openDelay, label, placement, ...props }, ref) => {
    const bg = useColorModeValue('music.800', 'music.100');
    const color = useColorModeValue('music.100', 'music.800');

    return (
      <ChakraTooltip
        ref={ref}
        bg={bg}
        color={color}
        fontSize="12px"
        openDelay={openDelay}
        label={label}
        placement={placement}
        // {...props}
      >
        {children}
      </ChakraTooltip>
    );
  },
);

export default Tooltip;
