import type { ReactNode } from 'react';
import { forwardRef } from 'react';

import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';

type TileProps = {
  image?: ReactNode;
  info?: ReactNode;
} & HTMLMotionProps<'div'>;

const Tile = forwardRef<HTMLDivElement, TileProps>(({ image, info, ...props }, ref) => {
  return (
    <motion.div ref={ref} {...props} className='stack-3 shrink-0'>
      {image}
      <div className='flex justify-between'>{info}</div>
    </motion.div>
  );
});

Tile.displayName = 'Tile';

export default Tile;
