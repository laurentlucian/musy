import { useParams } from '@remix-run/react';

import { Image } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import { useClickDrag } from '~/hooks/useDrawer';
import useSessionUser from '~/hooks/useSessionUser';
import { useTileContext } from '~/hooks/useTileContext';

import Tooltip from '../Tooltip';
type TileImageT = {
  profileId?: string;
  size?: string | string[];
};
const TileImage = ({ profileId, size = '200px' }: TileImageT) => {
  const { index, layoutKey, track, tracks } = useTileContext();
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
        src={track.image}
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
