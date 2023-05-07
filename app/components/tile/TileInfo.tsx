import { useParams } from '@remix-run/react';

import { Flex, Image, Stack, Text } from '@chakra-ui/react';

import explicitImage from '~/assets/explicit-solid.svg';
import { useClickDrag } from '~/hooks/useDrawer';
import { useTileContext } from '~/hooks/useTileContext';

import SpotifyLogo from '../icons/SpotifyLogo';

type TrackInfo = {
  action?: boolean;
  profileId?: string;
};

const TileInfo = ({ action, profileId }: TrackInfo) => {
  const { index, layoutKey, track, tracks } = useTileContext();
  const { onClick, onMouseDown, onMouseMove } = useClickDrag();
  const { id } = useParams();

  if (track.name === '' || !track.name) return null;

  const originId = profileId ?? id ?? null;

  return (
    <Stack
      spacing={0}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onClick={() => onClick(track, originId, layoutKey, tracks, index ?? 0)}
      cursor="pointer"
      w="175px"
    >
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
