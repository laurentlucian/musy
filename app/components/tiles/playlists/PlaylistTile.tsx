import { Link, useParams } from '@remix-run/react';
import { forwardRef } from 'react';

import { Box, Flex, Image, Stack, Text } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';

import Tooltip from '~/components/Tooltip';
import { decodeHtmlEntity } from '~/lib/utils';

type TileProps = { playlist: SpotifyApi.PlaylistObjectSimplified } & ChakraProps;

const PlaylistTile = forwardRef<HTMLDivElement, TileProps>(({ playlist, ...props }, ref) => {
  const { id } = useParams();

  return (
    <Stack ref={ref} flex="0 0 200px" {...props} cursor="pointer" pb={2}>
      <Link to={`/${id}/${playlist.id}`}>
        <Flex direction="column">
          <Tooltip label={playlist.name} placement="top-start">
            <Image
              boxSize="200px"
              objectFit="cover"
              src={playlist.images[0]?.url}
              draggable={false}
            />
          </Tooltip>
        </Flex>
        <Flex justify="space-between">
          <Stack spacing={0}>
            <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-all">
              {playlist.name}
            </Text>
            {playlist.description ? (
              <Flex align="center">
                <Text fontSize="11px" opacity={0.8} noOfLines={2}>
                  {decodeHtmlEntity(playlist.description)}
                </Text>
              </Flex>
            ) : (
              <Box h="13px" />
            )}
            <Text fontSize="11px">{playlist.tracks.total} songs</Text>
          </Stack>
        </Flex>
      </Link>
    </Stack>
  );
});

PlaylistTile.displayName = 'PlaylistTile';

export default PlaylistTile;
