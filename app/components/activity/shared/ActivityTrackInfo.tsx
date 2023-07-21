import type { FlexProps } from '@chakra-ui/react';
import { Flex, HStack, Image } from '@chakra-ui/react';

import LikedBy from '~/components/activity/LikedBy';
import PlayedBy from '~/components/activity/PlayedBy';
import QueuedBy from '~/components/activity/QueuedBy';
import explicitImage from '~/lib/assets/explicit-solid.svg';
import SpotifyLogo from '~/lib/icons/SpotifyLogo';
import type { TrackWithInfo } from '~/lib/types/types';

const ActivityTrackInfo = ({ track, ...props }: { track: TrackWithInfo } & FlexProps) => {
  const willOverflow =
    (track.liked && track.liked.length >= 5 && track.recent && track.recent.length >= 5) ||
    (track.queue && track.queue.length >= 5);

  return (
    <Flex justify="space-between" align="start" {...props} id="dont-close">
      <HStack>
        <LikedBy liked={track.liked} slice={willOverflow ? 2 : 5} />
        <PlayedBy played={track.recent} slice={willOverflow ? 2 : 5} />
        <QueuedBy queued={track.queue} slice={willOverflow ? 2 : 5} />
      </HStack>
      <HStack>
        {track.explicit && <Image src={explicitImage} w="15px" ml="auto !important" />}
        <SpotifyLogo icon w="21px" h="21px" />
      </HStack>
    </Flex>
  );
};

export default ActivityTrackInfo;
