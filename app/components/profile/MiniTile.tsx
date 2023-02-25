import { Link } from '@remix-run/react';

import { Flex, HStack, Image, Stack, Text } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';

import { useDrawerActions } from '~/hooks/useDrawer';
import type { Track } from '~/lib/types/types';
import { timeSince } from '~/lib/utils';

import Tooltip from '../Tooltip';

type MiniTileProps = Track & {
  createdAt?: Date;
  // will show header (profile above tile) if createdAt is defined
  createdBy?: Profile | null;
  layoutKey: string;
  userId: string;
};

const MiniTile = ({
  albumName,
  albumUri,
  artist,
  artistUri,
  createdAt,
  createdBy,
  explicit,
  id,
  image,
  layoutKey,
  link,
  name,
  preview_url,
  uri,
  userId,
}: MiniTileProps) => {
  const { onOpen } = useDrawerActions();
  const item = {
    albumName,
    albumUri,
    artist,
    artistUri,
    duration: 0,
    explicit,
    id,
    image,
    link,
    name,
    preview_url,
    uri,
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
          <Tooltip label={albumName} placement="top-start">
            <Image
              src={image}
              w="200px"
              draggable={false}
              onClick={() => onOpen(item, userId, layoutKey)}
            />
          </Tooltip>
        ) : (
          <Tooltip label={albumName} placement="top-start">
            <Image src={image} borderRadius={5} w="200px" draggable={false} />
          </Tooltip>
        )}
      </Flex>
      <Tooltip label={name} placement="top-start">
        <Text fontSize="12px" noOfLines={1} whiteSpace="normal" wordBreak="break-word">
          {name}
        </Text>
      </Tooltip>
    </Stack>
  );
};

export default MiniTile;
