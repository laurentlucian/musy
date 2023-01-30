import { HStack, Image, Stack, Text } from '@chakra-ui/react';

type PlayingFromType = {
  description?: string;
  image?: string;
  name?: string;
};

const decodeHtmlEntity = (str?: string) => {
  return str?.replace(/&#x([0-9A-Fa-f]+);/g, (_, dec) => {
    return String.fromCharCode(parseInt(dec, 16));
  });
};

const PlayingFromTooltip = ({ description, image, name }: PlayingFromType) => {
  return (
    <HStack p="0">
      <Image src={image} boxSize="55px" />
      <Stack py={2}>
        <Text fontWeight="bold" fontSize="12px">
          {name}
        </Text>
        <Text fontStyle="italic" fontSize="10px">
          {decodeHtmlEntity(description)}
        </Text>
      </Stack>
    </HStack>
  );
};

export default PlayingFromTooltip;
