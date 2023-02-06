import {
  Image,
  Link,
  Stack,
  Text,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  useColorModeValue,
} from '@chakra-ui/react';

import type { Profile, RecommendedSongs } from '@prisma/client';

import { timeSince } from '~/lib/utils';

import Tile from '../Tile';
import Tiles from './Tiles';
import RecommendActions from './RecommendActions';
import RecommendRatingForm from './RecommendRatingForm';

type RecommendedProps = RecommendedSongs & {
  sender: Profile;
};

const Recommended = ({ recommended }: { recommended: RecommendedProps[] }) => {
  const scrollButtons = recommended.length > 5;
  const show = recommended.length > 0;

  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.700');

  return (
    <>
      {show && (
        <Stack spacing={3}>
          <Tiles title="Recommended" scrollButtons={scrollButtons}>
            {recommended.map((recommended) => {
              const { isOpen, onToggle, onClose } = useDisclosure();
              return (
                <Stack key={recommended.id} direction="row">
                  <Link href={`/${recommended.senderId}`}>
                    <Image
                      borderRadius="full"
                      src={recommended.sender.image}
                      boxSize="40px"
                      mr="5px"
                    />
                  </Link>
                  <Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Stack direction="row">
                        <Link href={`/${recommended.senderId}`} _hover={{ textDecor: 'none' }}>
                          <Text fontSize={['10px', '11px']}>{recommended.sender.name}</Text>
                        </Link>
                        <Text fontSize={['9px', '10px']} opacity={0.6}>
                          {timeSince(recommended.createdAt)}
                        </Text>
                      </Stack>
                      <RecommendActions
                        trackId={recommended.trackId}
                        recommendedByName={recommended.sender.name}
                        recommendedByImage={recommended.sender.image}
                        onToggle={onToggle}
                      />
                    </Stack>
                    <Popover
                      returnFocusOnClose={false}
                      isOpen={isOpen}
                      onClose={onClose}
                      placement="bottom"
                    >
                      <PopoverTrigger>
                        <Tile
                          uri={recommended.uri}
                          trackId={recommended.trackId}
                          image={recommended.image}
                          albumUri={recommended.albumUri}
                          albumName={recommended.albumName}
                          name={recommended.name}
                          artist={recommended.artist}
                          artistUri={recommended.albumUri}
                          explicit={recommended.explicit}
                          preview_url={recommended.preview_url} // old recommended tracks dont have preview url :(((
                          link={recommended.link}
                        />
                      </PopoverTrigger>
                      <PopoverContent bg={bg} color={color}>
                        <PopoverBody>
                          <PopoverArrow bg={bg} />
                          <RecommendRatingForm sender={recommended.sender.name} />
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </Stack>
                </Stack>
              );
            })}
          </Tiles>
        </Stack>
      )}
    </>
  );
};

export default Recommended;
