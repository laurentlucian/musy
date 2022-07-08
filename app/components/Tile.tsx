import { AvatarGroup, Flex, HStack, Image, Stack, Text } from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import { Link, useFetcher, useParams } from '@remix-run/react';
import explicitImage from '~/assets/explicit-solid.svg';
import { timeSince } from '~/hooks/utils';
import AddQueue from './AddQueue';

type TileProps = {
  uri: string;
  image: string;
  name: string;
  artist: string;
  explicit: boolean;

  // @todo figure out a better way to require authentication on click;
  // after authentication redirect, add to queue isn't successful. user needs to click again
  userId?: string;

  // name, not Id
  sendTo?: string;

  // used by Activity - (from who; created by)
  user?: Profile | null;
  createdAt?: Date;
};

const Tile = ({
  uri,
  image,
  name,
  artist,
  explicit,
  userId,
  sendTo,
  user,
  createdAt,
}: TileProps) => {
  const { id } = useParams();

  return (
    <Stack flex="0 0 200px">
      <Flex direction="column">
        {createdAt && (
          <HStack align="center" h="35px">
            {user ? (
              <Link to={`/${user.userId}`}>
                <HStack align="center">
                  <Image borderRadius={50} boxSize="25px" mb={1} src={user.image} />
                  <Text fontWeight="semibold" fontSize="13px">
                    {user.name.split(' ')[0]}
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
              {timeSince(createdAt ?? null) + ' ago'}
            </Text>
          </HStack>
        )}

        <Image src={image} borderRadius={5} draggable={false} />
      </Flex>
      <Flex justify="space-between">
        <Stack spacing={0}>
          <Text fontSize="13px" noOfLines={3} whiteSpace="normal">
            {name}
          </Text>
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
            userId={userId}
            sendTo={sendTo}
          />
        </Flex>
      </Flex>
    </Stack>
  );
};

export default Tile;
