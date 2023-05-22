import { Flex, Image, Stack, Text } from '@chakra-ui/react';

import LikedBy from '~/components/home/activity/LikedBy';
import PlayedBy from '~/components/home/activity/PlayedBy';
import { useTileContext } from '~/hooks/useTileContext';
import explicitImage from '~/lib/assets/explicit-solid.svg';
import SpotifyLogo from '~/lib/icons/SpotifyLogo';

type TrackInfo = {
  action?: boolean;
};

const TileInfoTop = ({ action }: TrackInfo) => {
  const { track } = useTileContext();

  if (track.name === '' || !track.name) return null;

  return (
    <Flex direction="column" justify="space-between" w="175px">
      <Stack spacing={0}>
        <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-word">
          {track.name}
        </Text>
        {track.artist && (
          <Flex align="center">
            <Stack>
              <Stack direction="row">
                {track.explicit && <Image src={explicitImage} w="19px" mr="-3px" />}
                <Text fontSize="11px" opacity={0.8} noOfLines={2}>
                  {track.artist}
                </Text>
              </Stack>
              {action && <SpotifyLogo w="70px" h="21px" />}
            </Stack>
          </Flex>
        )}
      </Stack>
      <Stack spacing={1}>
        {track.liked?.length && <LikedBy liked={track.liked} />}
        {track.recent?.length && <PlayedBy played={track.recent} />}
      </Stack>
    </Flex>
  );
};

export default TileInfoTop;
