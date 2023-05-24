import type { StackProps } from '@chakra-ui/react';
import { Stack } from '@chakra-ui/react';

import { motion } from 'framer-motion';

const FadeLayout = ({ children, ...props }: StackProps) => {
  return (
    <Stack
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      h={['unset', 500]}
      overflowX="hidden"
      {...props}
      // transition={{ delay: 0.1 }}
    >
      {children}
    </Stack>
  );
};

export default FadeLayout;
