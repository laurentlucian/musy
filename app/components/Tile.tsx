import { Flex, Icon, IconButton, Image, Input, Spinner, Stack, Text } from '@chakra-ui/react';
import { useFetcher, useParams } from '@remix-run/react';
import { AddSquare, Send2, TickSquare } from 'iconsax-react';
import explicitImage from '~/assets/explicit-solid.svg';
import Tooltip from './Tooltip';

type Type = {
  uri: string;
  image: string;
  name: string;
  artist: string;
  explicit: boolean;

  // @todo figure out a better way to require authentication on click;
  // after authentication redirect, add to queue isn't successful. user needs to click again
  // not authenticated when `null`; `undefined` when not supposed to add to currentUser queue
  userId?: string | null;
};

const Tile = ({ uri, image, name, artist, explicit, userId }: Type) => {
  const { id } = useParams();
  const fetcher = useFetcher();

  const isAdding = fetcher.submission?.formData.get('uri') === uri;
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
        <Flex justify="center">
          {!isAdding && !isDone ? (
            <fetcher.Form
              replace
              method="post"
              action={userId === null ? '/auth/spotify?/' + id : `/${userId ?? id}/add`}
            >
              <Input type="hidden" name="uri" value={uri} />
              <Input type="hidden" name="image" value={image} />
              <Input type="hidden" name="name" value={name} />
              <Input type="hidden" name="artist" value={artist} />
              {/* empty string is falsy */}
              <Input type="hidden" name="explicit" value={explicit ? 'true' : ''} />
              <Tooltip label={userId === null || userId ? 'Add to your queue' : ''}>
                <IconButton
                  type="submit"
                  aria-label="queue"
                  icon={userId === null || userId ? <AddSquare /> : <Send2 />}
                  variant="ghost"
                  p={0}
                />
              </Tooltip>
            </fetcher.Form>
          ) : !isDone ? (
            <Spinner ml="auto" />
          ) : (
            <Icon ml="auto" textAlign="right" boxSize="25px" as={TickSquare} />
          )}
        </Flex>
      </Flex>
    </Stack>
  );
};

export default Tile;
