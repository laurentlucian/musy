import { Flex, HStack, Image, Stack, Text, Link as LinkB } from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import { Link, useParams } from '@remix-run/react';
import explicitImage from '~/assets/explicit-solid.svg';
import { timeSince } from '~/hooks/utils';
import AddQueue from './AddQueue';

type TileProps = {
  uri: string;
  image: string;
  name: string;
  artist: string;
  explicit: boolean;

  // name, not Id
  sendTo?: string;

  user: Profile | null;
  // will show header (profile above tile) if createdAt is defined
  createdBy?: Profile | null;
  createdAt?: Date;
};

const Tile = ({
  uri,
  image,
  name,
  artist,
  explicit,
  sendTo,
  user,
  createdAt,
  createdBy,
}: TileProps) => {
  const { id } = useParams();

  return (
    <Stack flex="0 0 200px">
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

        <Image src={image} borderRadius={5} w="200px" draggable={false} />
      </Flex>
      <Flex justify="space-between">
        <Stack spacing={0}>
          <LinkB href={uri} target="_blank">
            <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-word">
              {name}
            </Text>
          </LinkB>
          <Flex align="center">
            {explicit && <Image src={explicitImage} mr={1} w="19px" />}
            <Text fontSize="11px" opacity={0.8}>
              {artist}
            </Text>
          </Flex>
        </Stack>
        <Flex minW="35px" justify="center">
          <AddQueue
            key={id}
            uri={uri}
            image={image}
            name={name}
            artist={artist}
            explicit={explicit ?? false}
            userId={user?.userId}
            sendTo={sendTo}
          />
        </Flex>
      </Flex>
    </Stack>
  );
};

export default Tile;
