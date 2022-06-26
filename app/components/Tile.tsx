import { Flex, Icon, IconButton, Image, Input, Spinner, Stack, Text } from '@chakra-ui/react';
import { useFetcher, useParams } from '@remix-run/react';
import { AddSquare, TickSquare } from 'iconsax-react';
import explicitImage from '~/assets/explicit-solid.svg';

type Type = {
  uri: string;
  image: string;
  name: string;
  artist: string;
  explicit: boolean;
};

const Tile = ({ uri, image, name, artist, explicit }: Type) => {
  const { id } = useParams();
  const fetcher = useFetcher();

  const isAdding = fetcher.submission?.formData.get('track') === uri;
  const isDone = fetcher.type === 'done';

  return (
    <Stack flex="0 0 200px">
      <Image src={image} borderRadius={5} draggable={false} />
      <Flex justify="space-between">
        <Stack spacing={0}>
          <Text fontSize="sm">{name}</Text>
          <Flex align="center">
            {explicit && <Image src={explicitImage} mr={1} w="19px" />}
            <Text fontSize="xs" opacity={0.8}>
              {artist}
            </Text>
          </Flex>
        </Stack>
        {!isAdding && !isDone ? (
          <Flex as={fetcher.Form} replace method="post" action={`/${id}/add`}>
            <Input type="hidden" name="track" value={uri} />
            <Input type="hidden" name="image" value={image} />
            <Input type="hidden" name="trackName" value={name} />
            <Input type="hidden" name="artist" value={artist} />
            {explicit && <Input type="hidden" name="explicit" value={'true'} />}
            <IconButton type="submit" aria-label="queue" icon={<AddSquare />} variant="ghost" />
          </Flex>
        ) : !isDone ? (
          <Spinner ml="auto" mr={2} />
        ) : (
          <Icon ml="auto" textAlign="right" boxSize="25px" as={TickSquare} mr={2} />
        )}
      </Flex>
    </Stack>
  );
};

export default Tile;
