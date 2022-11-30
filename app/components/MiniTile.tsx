import { Flex, HStack, Image, Stack, Text, Link as LinkB } from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import { Link, useParams } from '@remix-run/react';
import explicitImage from '~/assets/explicit-solid.svg';
import { timeSince } from '~/hooks/utils';
import AddQueue from './AddQueue';
import Tooltip from './Tooltip';

type TileProps = {
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

  user: Profile | null;
  // will show header (profile above tile) if createdAt is defined
  createdBy?: Profile | null;
  createdAt?: Date;
};

const MiniTile = ({ uri, image, albumUri, albumName, name, createdAt, createdBy }: TileProps) => {
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
          <LinkB href={albumUri} target="_blank">
            <Tooltip label={albumName} placement="top-start">
              <Image src={image} borderRadius={5} w="200px" draggable={false} />
            </Tooltip>
          </LinkB>
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
