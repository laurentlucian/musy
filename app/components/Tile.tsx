import { Image, Stack, Text } from '@chakra-ui/react';

type Type = {
  key: string;
  image: string;
  name: string;
  artist: string;
};

const Tile = ({ key, image, name, artist }: Type) => {
  return (
    <Stack key={key} flex="0 0 200px">
      <Image src={image} borderRadius={5} />
      <Stack spacing={0}>
        <Text fontSize="sm">{name}</Text>
        <Text fontSize="xs" opacity={0.8}>
          {artist}
        </Text>
      </Stack>
    </Stack>
  );
};

export default Tile;
