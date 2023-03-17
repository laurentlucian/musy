import { useParams } from '@remix-run/react';

import { Image } from '@chakra-ui/react';

import type { Track } from '@prisma/client';
import { motion } from 'framer-motion';

import { useClickDrag } from '~/hooks/useDrawer';
import useSessionUser from '~/hooks/useSessionUser';

import Tooltip from './Tooltip';
type TileImageT = {
  index: number;
  layoutKey: string;
  profileId?: string;
  size?: string | string[];
  src: string;
  track: Track;
  tracks: Track[];
};
const TileImage = ({
  index,
  layoutKey,
  profileId,
  size = '200px',
  src,
  track,
  tracks,
}: TileImageT) => {
  const { onClick, onMouseDown, onMouseMove } = useClickDrag();
  const { id } = useParams();
  const currentUser = useSessionUser();
  const currentUserId = currentUser?.userId;
  const originId = profileId ?? id ?? currentUserId ?? null;
  const layoutId = track.id + layoutKey;
  return (
    <Tooltip label={track.albumName} placement="top-start">
      <Image
        as={motion.img}
        layoutId={layoutId}
        boxSize={size}
        minW={size}
        minH={size}
        objectFit="cover"
        src={src}
        draggable={false}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onClick={() => onClick(track, originId, layoutKey, tracks, index)}
        cursor="pointer"
      />
    </Tooltip>
  );
};

export default TileImage;
