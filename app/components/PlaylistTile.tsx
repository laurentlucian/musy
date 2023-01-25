import { Box, Flex, Image, Stack, Text } from '@chakra-ui/react';
import { usePlaylistDrawerActions } from '~/hooks/usePlaylistDrawer';
import type { PlaylistTrack } from '~/lib/types/types';
import type { ChakraProps } from '@chakra-ui/react';
import { forwardRef } from 'react';
import Tooltip from './Tooltip';

type TileProps = {
  uri: string;
  image: string;
  name: string;
  tracks: number;
  description: string | null;
} & ChakraProps;

const PlaylistTile = forwardRef<HTMLDivElement, TileProps>(
  ({ uri, image, name, tracks, description, ...props }, ref) => {
    const decodeHtmlEntity = (str?: string) => {
      return str?.replace(/&#x([0-9A-Fa-f]+);/g, (_, dec) => {
        return String.fromCharCode(parseInt(dec, 16));
      });
    };

    const { onOpen } = usePlaylistDrawerActions();
    const track: PlaylistTrack = {
      uri: uri,
      trackId: '',
      image,
      name,
      description,
      explicit: false,
    };
    console.log(tracks);

    return (
      <>
        <Stack ref={ref} flex="0 0 200px" {...props} cursor="pointer">
          <Flex direction="column">
            {/* {createdAt && (
              <HStack align="center" h="35px">
                {createdBy ? (
                  <Link to={`/${createdBy.userId}`}>
                    <HStack align="center">
                      <Image borderRadius={50} boxSize="25px" mb={1} src={createdBy.image} />
                      <Text fontWeight="semibold" fontSize="13px">
                        {createdBy.name.split(' ')[0]}
                      </Text>
                    </HStack>
                  </Link>
                ) : (
                  <Text fontWeight="semibold" fontSize="13px">
                    Anon
                  </Text>
                )}
                <Text as="span">·</Text>
                <Text fontSize="12px" opacity={0.6}>
                  {timeSince(createdAt ?? null)}
                </Text>
              </HStack>
            )} */}
            <Tooltip label={name} placement="top-start">
              <Image
                boxSize="200px"
                objectFit="cover"
                src={image}
                draggable={false}
                onClick={() => onOpen(track)}
              />
            </Tooltip>
          </Flex>
          <Flex justify="space-between">
            <Stack spacing={0} onClick={() => onOpen(track)}>
              <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-word">
                {name}
              </Text>
              {description ? (
                <Flex align="center">
                  <Text fontSize="11px" opacity={0.8} noOfLines={2}>
                    {decodeHtmlEntity(description)}
                  </Text>
                </Flex>
              ) : (
                <Box h="13px" />
              )}
              <Text fontSize="11px">{tracks} songs</Text>
            </Stack>
          </Flex>
        </Stack>
      </>
    );
  },
);

PlaylistTile.displayName = 'Tile';

export default PlaylistTile;
