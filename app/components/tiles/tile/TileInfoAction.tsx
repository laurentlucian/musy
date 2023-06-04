import { Flex, Image, Stack, Text } from '@chakra-ui/react';

import { useTileContext } from '~/hooks/useTileContext';
import explicitImage from '~/lib/assets/explicit-solid.svg';
import SpotifyLogo from '~/lib/icons/SpotifyLogo';

type TrackInfo = {
  action?: boolean;
};

const TileInfo = ({ action }: TrackInfo) => {
  const { track } = useTileContext();

  if (track.name === '' || !track.name) return null;

  return (
    <Stack spacing={0} cursor="pointer" w="175px">
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
            {action ? <SpotifyLogo w="70px" h="21px" /> : null}
          </Stack>
        </Flex>
      )}
    </Stack>
  );
};

export default TileInfo;
