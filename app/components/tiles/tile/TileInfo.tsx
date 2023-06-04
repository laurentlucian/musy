import type { ReactNode } from 'react';

import { Flex, Image, Stack, Text } from '@chakra-ui/react';

import { useTileContext } from '~/hooks/useTileContext';
import explicitImage from '~/lib/assets/explicit-solid.svg';

const TileInfo = ({ children }: { children?: ReactNode }) => {
  const { track } = useTileContext();

  if (track.name === '' || !track.name) return null;

  return (
    <Flex direction="column" justify="space-between" w="175px">
      <Stack spacing={0}>
        <Text fontSize={['12px', '13px']} noOfLines={3} whiteSpace="normal" wordBreak="break-word">
          {track.name}
        </Text>
        {track.artist && (
          <Flex align="center">
            <Stack>
              <Stack direction="row">
                {track.explicit && <Image src={explicitImage} w="19px" mr="-3px" />}
                <Text fontSize={['9px', '10px']} opacity={0.8} noOfLines={2}>
                  {track.artist}
                </Text>
              </Stack>
            </Stack>
          </Flex>
        )}
      </Stack>
      {children}
    </Flex>
  );
};

export default TileInfo;
