import { AvatarGroup, Flex, Image, Stack, Text } from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import { useFetcher, useParams } from '@remix-run/react';
import explicitImage from '~/assets/explicit-solid.svg';
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
};

const Tile = ({ uri, image, name, artist, explicit, userId, sendTo, user }: TileProps) => {
  const { id } = useParams();

  return (
    <Stack flex="0 0 200px">
      <Image src={image} borderRadius={5} draggable={false} />
      <Flex justify="space-between">
        <Stack spacing={0}>
          <Text fontSize="sm" noOfLines={3} whiteSpace="normal">
            {name}
          </Text>
          <Flex align="center">
            {explicit && <Image src={explicitImage} mr={1} w="19px" />}
            <Text fontSize="xs" opacity={0.8}>
              {artist}
            </Text>
          </Flex>
        </Stack>
        <Flex justify="center">
          {user ? (
            <Image borderRadius={50} boxSize={8} src={user.image} />
          ) : (
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
          )}
        </Flex>
      </Flex>
    </Stack>
  );
};

export default Tile;
