import { HStack, Text, Box, Link as ChakraLink, Flex } from '@chakra-ui/react';

import SpotifyLogo from '~/lib/icons/SpotifyLogo';
import type { TrackWithInfo } from '~/lib/types/types';
import { timeSince } from '~/lib/utils';

const TileTrackInfo = ({
  createdAt,
  icon = true,
  track,
}: {
  createdAt?: Date;
  icon?: boolean;
  track: TrackWithInfo;
}) => {
  return (
    <Flex justify="space-between" w="100%">
      <Flex direction="column" flexGrow={1}>
        <ChakraLink
          href={track.uri}
          fontSize={['12px', '13px']}
          noOfLines={1}
          whiteSpace="normal"
          wordBreak="break-word"
        >
          {track.name}
        </ChakraLink>
        <HStack spacing={1}>
          <ChakraLink
            href={track.artistUri}
            fontSize={['9px', '10px']}
            opacity={0.6}
            noOfLines={1}
            flexShrink={0}
          >
            {track.artist}
          </ChakraLink>
          <Box opacity={0.6}>•</Box>
          <ChakraLink href={track.albumUri} fontSize={['9px', '10px']} opacity={0.6} noOfLines={1}>
            {track.albumName}
          </ChakraLink>
        </HStack>
        {createdAt && (
          <Text fontSize={['8px', '9px']} opacity={0.6} w="100%">
            {timeSince(createdAt)}
          </Text>
        )}
      </Flex>
      {icon && <SpotifyLogo icon w="21px" h="21px" />}
    </Flex>
  );
};

export default TileTrackInfo;
