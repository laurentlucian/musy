import { Flex, HStack, Image, Stack, Text, Link as LinkB, Icon } from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import { Link, useParams } from '@remix-run/react';
import { InfoCircle } from 'iconsax-react';
import explicitImage from '~/assets/explicit-solid.svg';
import { timeSince } from '~/hooks/utils';
import AddQueue from './menu/AddQueue';
import Tooltip from './Tooltip';

type TileProps = {
  id?: string;
  uri: string;
  image: string;
  albumUri: string | null;
  albumName: string | null;
  name: string;
  artist: string;
  artistUri: string | null;
  explicit: boolean;

  // name, not Id
  sendTo?: string;

  // will show header (profile above tile) if createdAt is defined
  createdBy?: Profile | null;
  createdAt?: Date;
};

const MiniTile = ({
  id,
  uri,
  image,
  albumUri,
  albumName,
  name,
  createdAt,
  createdBy,
}: TileProps) => {
  return (
    <Stack flex="0 0 100px">
      <Flex direction="column">
        {createdAt && (
          <HStack align="center" h="35px">
            {createdBy ? (
              <Link to={`/${createdBy.userId}`}>
                <HStack align="center">
                  <Tooltip label={createdBy.name} placement="top-start">
                    <Image borderRadius={50} boxSize="25px" mb={1} src={createdBy.image} />
                  </Tooltip>
                </HStack>
              </Link>
            ) : (
              <Text fontWeight="semibold" fontSize="13px">
                Anon
              </Text>
            )}
            <Text fontSize="11px" opacity={0.6}>
              {timeSince(createdAt ?? null)}
            </Text>
          </HStack>
        )}
        {albumUri ? (
          <Link to={`/analysis/${id}`}>
            <Tooltip
              label={
                <HStack p="2px">
                  <Text>{name}</Text>
                  <Icon boxSize="20px" as={InfoCircle} />
                </HStack>
              }
              placement="top-start"
            >
              <Image src={image} borderRadius={5} w="200px" draggable={false} />
            </Tooltip>
          </Link>
        ) : (
          <Tooltip label={albumName} placement="top-start">
            <Image src={image} borderRadius={5} w="200px" draggable={false} />
          </Tooltip>
        )}
      </Flex>
      <Tooltip label={name} placement="top-start">
        <LinkB href={uri} target="_blank">
          <Text fontSize="12px" noOfLines={1} whiteSpace="normal" wordBreak="break-word">
            {name}
          </Text>
        </LinkB>
      </Tooltip>
    </Stack>
  );
};

export default MiniTile;
