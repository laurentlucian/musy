import { Button, Flex, HStack, Icon, Image, Input, Spinner, Text, VStack } from '@chakra-ui/react';
import { useFetcher, useParams } from '@remix-run/react';
import { TickSquare } from 'iconsax-react';
// import { Queue } from '@prisma/client';
// import type { ActionFunction } from '@remix-run/node';
// import { prisma } from '~/services/db.server';
// import explicit from '../assets/explicit-solid.svg';

type SearchItemType = {
  uri: string;
  name: string;
  image: string;
  artist: string;
  // explicit: string;
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
            <Input
              fontSize="13px"
              textAlign="left"
              noOfLines={1}
              whiteSpace="normal"
              value={name}
              name="name"
            />
            <Flex>
              <Text fontSize="13px" noOfLines={1} whiteSpace="normal">
                {artist}
              </Text>
            </Flex>
          </VStack>
        </HStack>
        {isAdding && <Spinner ml="auto" mr={2} />}
        {isDone && <Icon ml="auto" textAlign="right" boxSize="25px" as={TickSquare} mr={2} />}
      </Button>
    </Flex>
  );
};

export default SearchItem;

// export const action: ActionFunction = async ({ request }) => {
//   const form = await request.formData();
//   const trackName = form.get('name');

//   if (typeof trackName !== 'string') {
//     throw new Error(`Form not submitted correctly.`);
//   }

//   const fields = { trackName };

//   const queuedSong = await prisma.queue.create({ data: fields });
//   return queuedSong;
// };
