import { Image } from '@chakra-ui/react';

import { useFullscreen } from '~/components/fullscreen/Fullscreen';
import FullscreenTrack from '~/components/fullscreen/track/FullscreenTrack';
import type { ProfileWithInfo } from '~/lib/types/types';

const TileUserImage = ({ user }: { user: ProfileWithInfo }) => {
  const { onOpen } = useFullscreen();

  return (
    <Image
      minW="50px"
      maxW="50px"
      minH="50px"
      maxH="50px"
      borderRadius="100%"
      src={user.image}
      padding={user.playback ? '2px' : undefined}
      border={user.playback ? '2px solid' : undefined}
      cursor={user.playback ? 'pointer' : undefined}
      onClick={(e) => {
        if (user.playback) {
          e.preventDefault();
          onOpen(<FullscreenTrack track={user.playback.track} originUserId={user.userId} />);
        }
      }}
    />
  );
};

export default TileUserImage;
