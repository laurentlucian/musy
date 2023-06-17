import type { BoxProps, ImageProps } from '@chakra-ui/react';
import { Flex } from '@chakra-ui/react';
import { Image } from '@chakra-ui/react';

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
    <Flex flexShrink={0} {...box}>
      <Image
        borderRadius="1px"
        w="100%"
        draggable={false}
        objectFit="cover"
        cursor={fullscreen ? 'cursor' : 'unset'}
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
  );
};

export default TileTrackImage;
