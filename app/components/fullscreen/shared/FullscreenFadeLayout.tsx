import type { ReactNode } from 'react';

import { motion } from 'framer-motion';

import { cn } from '~/lib/cn';

type Props = {
  children: ReactNode;
  className?: string;
};

const FullscreenFadeLayout = ({ children, className }: Props) => {
  return (
    <motion.div
      className={cn('flex w-full', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
};

export default FullscreenFadeLayout;
