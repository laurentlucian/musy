import type { FlexProps } from '@chakra-ui/react';
import { Flex } from '@chakra-ui/react';
import { HStack } from '@chakra-ui/react';
import { Image } from '@chakra-ui/react';

import LikedBy from '~/components/activity/LikedBy';
import PlayedBy from '~/components/activity/PlayedBy';
import QueuedBy from '~/components/activity/QueuedBy';
import explicitImage from '~/lib/assets/explicit-solid.svg';
import SpotifyLogo from '~/lib/icons/SpotifyLogo';
import type { TrackWithInfo } from '~/lib/types/types';

const ActivityTrackInfo = ({ track, ...props }: { track: TrackWithInfo } & FlexProps) => {
  return (
    <Flex justify="space-between" align="start" {...props}>
      <HStack>
        <LikedBy liked={track.liked} />
        <PlayedBy played={track.recent} />
        <QueuedBy queued={track.queue} />
      </HStack>
      <HStack>
        {track.explicit && <Image src={explicitImage} w="15px" ml="auto !important" />}
        <SpotifyLogo icon w="21px" h="21px" />
      </HStack>
    </Flex>
  );
};

export default ActivityTrackInfo;
