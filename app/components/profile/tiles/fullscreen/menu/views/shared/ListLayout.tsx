import type { ReactNode } from 'react';

import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';

const ListLayout = ({ children, ...props }: { children: ReactNode } & BoxProps) => {
  return <Box {...props}>{children}</Box>;
};

export default ListLayout;
