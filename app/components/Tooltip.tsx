import type { TooltipProps } from '@chakra-ui/react';
import { Tooltip as ChakraTooltip } from '@chakra-ui/react';
import { forwardRef, useColorModeValue } from '@chakra-ui/system';

const Tooltip = forwardRef<TooltipProps, 'div'>(
  ({ children, hasArrow, isDisabled, label, openDelay, placement = 'top', ...props }, ref) => {
    const bg = useColorModeValue('musy.100', 'musy.800');
    const color = useColorModeValue('musy.800', 'musy.100');
    return (
      <ChakraTooltip
        ref={ref}
        bg={bg}
        color={color}
        fontSize="12px"
        openDelay={openDelay}
        label={label}
        placement={placement}
        hasArrow={hasArrow}
        isDisabled={isDisabled}
        {...props}
      >
        {children}
      </ChakraTooltip>
    );
  },
);

export default Tooltip;
