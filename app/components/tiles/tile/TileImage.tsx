import { useParams } from '@remix-run/react';

import { Image } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import { useFullscreen } from '~/components/fullscreen/Fullscreen';
import FullscreenTrack from '~/components/fullscreen/track/FullscreenTrack';
import Tooltip from '~/components/Tooltip';
import useSessionUser from '~/hooks/useSessionUser';
import { useTileContext } from '~/hooks/useTileContext';

type TileImageT = {
  profileId?: string;
  size?: string | string[];
};
const TileImage = ({ profileId, size = '200px' }: TileImageT) => {
  const { onOpen } = useFullscreen();
  const { index, layoutKey, track, tracks } = useTileContext();
  const { id } = useParams();
  const currentUser = useSessionUser();

  if (!track.image) return null;

  const currentUserId = currentUser?.userId;
  const originId = profileId ?? id ?? currentUserId;
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
        onClick={() => onOpen(<FullscreenTrack track={track} originUserId={originId} />)}
        cursor="pointer"
      />
    </Tooltip>
  );
};

export default TileImage;
