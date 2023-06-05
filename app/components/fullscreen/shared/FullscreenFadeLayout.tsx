import type { StackProps } from '@chakra-ui/react';
import { Flex } from '@chakra-ui/react';

import { motion } from 'framer-motion';

const FullscreenFadeLayout = ({ children, ...props }: StackProps) => {
  return (
    <Flex
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      w="100%"
      {...props}
    >
      {children}
    </Flex>
  );
};

export default FullscreenFadeLayout;
