import { Flex, HStack, Image, Stack, Text } from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import { Link } from '@remix-run/react';
import { useDrawerActions } from '~/hooks/useDrawer';
import { timeSince } from '~/hooks/utils';
import type { Track } from '~/lib/types/types';
import Tooltip from './Tooltip';

type MiniTileProps = {
  track: {
    trackId: string;
    uri: string;
    image: string;
    albumUri: string | null;
    albumName: string | null;
    name: string;
    artist: string;
    artistUri: string | null;
    explicit: boolean;
  };

  // will show header (profile above tile) if createdAt is defined
  createdBy?: Profile | null;
  createdAt?: Date;
};

const MiniTile = ({
  track: { trackId, uri, image, albumUri, albumName, name, artist, artistUri, explicit },
  createdAt,
  createdBy,
}: MiniTileProps) => {
  const { onOpen } = useDrawerActions();
  const item: Track = {
    uri,
    trackId,
    image,
    albumUri,
    albumName,
    name,
    artist,
    artistUri,
    explicit,
  };
  return (
    <Stack flex="0 0 100px">
      <Flex direction="column">
        {createdAt && (
          <HStack align="center" h="35px">
            {createdBy ? (
              <Link to={`/${createdBy.userId}`}>
                <HStack align="center">
                  <Tooltip label={createdBy.name} placement="top-start">
                    <Image
                      borderRadius={50}
                      boxSize="25px"
                      minW="25px"
                      mb={1}
                      src={createdBy.image}
                    />
                  </Tooltip>
                </HStack>
              </Link>
            ) : null}
            <Text fontSize={['9px', '10px']} minW="max-content" opacity={0.6}>
              {timeSince(createdAt ?? null)}
            </Text>
          </HStack>
        )}
        {albumUri ? (
          // <LinkB href={albumUri} target="_blank">
          <Tooltip label={albumName} placement="top-start">
            <Image
              src={image}
              borderRadius={5}
              w="200px"
              draggable={false}
              onClick={() => onOpen(item)}
            />
          </Tooltip>
        ) : (
          // </LinkB>
          <Tooltip label={albumName} placement="top-start">
            <Image src={image} borderRadius={5} w="200px" draggable={false} />
          </Tooltip>
        )}
      </Flex>
      <Tooltip label={name} placement="top-start">
        {/* <LinkB href={uri} target="_blank"> */}
        <Text fontSize="12px" noOfLines={1} whiteSpace="normal" wordBreak="break-word">
          {name}
        </Text>
        {/* </LinkB> */}
      </Tooltip>
    </Stack>
  );
};

export default MiniTile;
