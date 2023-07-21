import type { BoxProps, ImageProps } from '@chakra-ui/react';
import { Flex, Image } from '@chakra-ui/react';

import { AnimatePresence, motion } from 'framer-motion';

import { useFullscreen } from '~/components/fullscreen/Fullscreen';
import FullscreenTrack from '~/components/fullscreen/track/FullscreenTrack';
import type { TrackWithInfo } from '~/lib/types/types';

type TileTrackImageProps = {
  box?: BoxProps;
  fullscreen?: {
    originUserId?: string;
    track: TrackWithInfo;
  };
  image?: ImageProps;
};

const TileTrackImage = ({ box, fullscreen, image }: TileTrackImageProps) => {
  const { onMouseDown, onMouseMove, onOpen } = useFullscreen();
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: '1' }}>
        <Flex flexShrink={0} {...box}>
          <Image
            borderRadius="1px"
            w="100%"
            draggable={false}
            objectFit="cover"
            cursor={fullscreen ? 'pointer' : 'unset'}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onClick={() =>
              fullscreen &&
              onOpen(
                <FullscreenTrack track={fullscreen.track} originUserId={fullscreen.originUserId} />,
              )
            }
            {...image}
          />
        </Flex>
      </motion.div>
    </AnimatePresence>
  );
};

export default TileTrackImage;
