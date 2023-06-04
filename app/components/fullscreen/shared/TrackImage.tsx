import { HStack, Image, Stack } from '@chakra-ui/react';

import LikedBy from '~/components/home/activity/LikedBy';
import PlayedBy from '~/components/home/activity/PlayedBy';
import explicitImage from '~/lib/assets/explicit-solid.svg';
import type { TrackWithInfo } from '~/lib/types/types';

const TrackImage = (props: { track: TrackWithInfo }) => {
  const { track } = props;

  return (
    <Stack w="65%" spacing={['10px']}>
      <Image
        objectFit="cover"
        src={track.image}
        draggable={false}
        zIndex={10}
        // minH="253px" // minH to prevent jumping when using arrow keys
      />
      <HStack mt={['5px', '15px']}>
        {track.liked?.length && <LikedBy liked={track.liked} />}
        {track.recent?.length && <PlayedBy played={track.recent} />}
        {track.explicit && <Image src={explicitImage} w="15px" ml="auto !important" />}
      </HStack>
    </Stack>
  );
};

export default TrackImage;
