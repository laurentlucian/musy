import { Button, Flex, HStack, Icon, Image, Input, Spinner, Text, VStack } from '@chakra-ui/react';
import { useFetcher, useParams } from '@remix-run/react';
import { TickSquare } from 'iconsax-react';

type SearchItemType = {
  uri: string;
  name: string;
  image: string;
  artist: string;
};

const SearchItem = ({ uri, name, image, artist }: SearchItemType) => {
  const { id } = useParams();
  const fetcher = useFetcher();
  const isAdding = fetcher.submission?.formData.get('track') === uri;
  const isDone = fetcher.type === 'done';

  return (
    // https://remix.run/docs/en/v1.5.1/api/remix#fetcherform
    <Flex as={fetcher.Form} replace method="post" action={`/${id}/add`}>
      <Input type="hidden" name="track" value={uri} />
      <Button
        type="submit"
        aria-label="queue"
        variant="ghost"
        justifyContent="start"
        h="auto"
        w="100%"
        p={0}
        _hover={{ bg: 'none' }}
      >
        <HStack justify="start">
          <Image src={image} w="50px" alt="track-cover" />
          <VStack align="start">
            <Text fontSize="13px" textAlign="left" noOfLines={1} whiteSpace="normal">
              {name}
            </Text>
            <Text fontSize="13px" noOfLines={1} whiteSpace="normal">
              {artist}
            </Text>
          </VStack>
        </HStack>
        {isAdding && <Spinner ml="auto" mr={2} />}
        {isDone && <Icon ml="auto" textAlign="right" boxSize="25px" as={TickSquare} mr={2} />}
      </Button>
    </Flex>
  );
};

export default SearchItem;
