import { Flex, HStack, Image, Stack, Text } from '@chakra-ui/react';
import explicitImage from '~/assets/explicit-solid.svg';
import type { ChakraProps } from '@chakra-ui/react';
import { useClickDrag } from '~/hooks/useDrawer';
import type { Track } from '~/lib/types/types';
import type { Profile } from '@prisma/client';
import { timeSince } from '~/lib/utils';
import { Link } from '@remix-run/react';
import { forwardRef } from 'react';
import Tooltip from './Tooltip';

type TileProps = {
  uri: string;
  trackId: string;
  image: string;
  albumUri: string | null;
  albumName: string | null;
  name: string;
  artist: string | null;
  artistUri: string | null;
  explicit: boolean;
  preview_url: string | null;
  link: string;

  // will show header (profile above tile) if createdAt is defined
  createdBy?: Profile | null;
  createdAt?: Date;
  playlist?: Boolean;
} & ChakraProps;

const Tile = forwardRef<HTMLDivElement, TileProps>(
  (
    {
      uri,
      trackId,
      image,
      albumUri,
      albumName,
      name,
      artist,
      artistUri,
      explicit,
      preview_url,
      link,
      createdAt,
      createdBy,
      playlist,
      ...props
    },
    ref,
  ) => {
    const decodeHtmlEntity = (str?: string) => {
      return str?.replace(/&#x([0-9A-Fa-f]+);/g, (_, dec) => {
        return String.fromCharCode(parseInt(dec, 16));
      });
    };
    const { onMouseDown, onMouseMove, onClick } = useClickDrag();
    const track: Track = {
      uri: uri,
      trackId,
      image,
      albumUri,
      albumName,
      name,
      artist,
      artistUri,
      explicit,
      preview_url,
      link,
    };

    return (
      <>
        <Stack ref={ref} flex="0 0 200px" {...props} cursor="pointer">
          <Flex direction="column">
            {createdAt && (
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
            )}
            <Tooltip label={albumName} placement="top-start">
              <Image
                boxSize="200px"
                minW="200px"
                objectFit="cover"
                src={image}
                draggable={false}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onClick={() => onClick(track)}
              />
            </Tooltip>
          </Flex>
          <Flex justify="space-between">
            <Stack
              spacing={0}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onClick={() => onClick(track)}
            >
              <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-word">
                {name}
              </Text>
              {artist && (
                <Flex align="center">
                  {explicit && <Image src={explicitImage} mr={1} w="19px" />}
                  {artistUri ? (
                    <Text fontSize="11px" opacity={0.8} noOfLines={2}>
                      {artist}
                    </Text>
                  ) : (
                    <Text fontSize="11px" opacity={0.8} noOfLines={2}>
                      {decodeHtmlEntity(artist)}
                    </Text>
                  )}
                </Flex>
              )}
            </Stack>
          </Flex>
        </Stack>
      </>
    );
  },
);

Tile.displayName = 'Tile';

export default Tile;
