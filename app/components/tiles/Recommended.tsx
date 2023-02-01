import { IconButton, Image, Link, Stack, Text } from '@chakra-ui/react';

import type { Profile, RecommendedSongs } from '@prisma/client';
import { Minus } from 'iconsax-react';

import { timeSince } from '~/lib/utils';

import Tile from '../Tile';
import Tiles from './Tiles';

import type { action } from '~/routes/$id/removeRecommend'; // why is this value never read?
import { useTypedFetcher } from 'remix-typedjson';
import { useParams } from '@remix-run/react';

type RecommendedProps = RecommendedSongs & {
  sender: Profile;
};

const Recommended = ({ recommended }: { recommended: RecommendedProps[] }) => {
  const scrollButtons = recommended.length > 5;
  const show = recommended.length > 0;
  const { id } = useParams();
  const fetcher = useTypedFetcher<typeof action>();
  const action = `/${id}/removeRecommend`;

  return (
    <>
      {show && (
        <Stack spacing={3}>
          <Tiles title="Recommended" scrollButtons={scrollButtons}>
            {recommended.map((recommended) => {
              const removeFromRecommended = () => {
                fetcher.submit(
                  { trackId: recommended.trackId },
                  { action, method: 'post', replace: true },
                );
              };
              return (
                <Stack key={recommended.id}>
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
                  <Stack direction="row" justify="space-between">
                    <Stack direction="row">
                      <Link href={`/${recommended.senderId}`}>
                        <Image
                          borderRadius="full"
                          src={recommended.sender.image}
                          boxSize="40px"
                          mr="5px"
                        />
                      </Link>
                      <Stack>
                        <Link href={`/${recommended.senderId}`} _hover={{ textDecor: 'none' }}>
                          <Text fontSize={['10px', '11px']}>{recommended.sender.name}</Text>
                        </Link>
                        <Text fontSize={['9px', '10px']} opacity={0.6}>
                          {timeSince(recommended.createdAt)}
                        </Text>
                      </Stack>
                    </Stack>
                    <IconButton
                      p={0}
                      variant="ghost"
                      aria-label="remove from recommended"
                      _hover={{ color: 'red' }}
                      icon={<Minus size="32" />}
                      onClick={removeFromRecommended}
                    />
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
