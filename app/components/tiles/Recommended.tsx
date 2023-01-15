import { Image, Link, Stack, Text } from '@chakra-ui/react';
import type { Profile, RecommendedSongs } from '@prisma/client';
import Tile from '../Tile';
import Tiles from './Tiles';
import { timeSince } from '~/lib/utils';
import RecommendActions from './RecommendActions';
// import RecommendActions from './RecommendActions';

interface RecommendedProps extends RecommendedSongs {
  senderProfile?: Profile;
}

const Recommended = ({ recommended }: { recommended: RecommendedProps[] }) => {
  const scrollButtons = recommended.length > 5;
  const show = recommended.length > 0;

  return (
    <>
      {show && (
        <Stack spacing={3}>
          <Tiles title="Recommended" scrollButtons={scrollButtons}>
            {recommended.map((recommended) => {
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
                  />

                  <Stack direction="row">
                    {/* <RecommendActions
                      recommendedBy={recommended.senderProfile}
                      trackId={recommended.trackId}
                    /> */}
                    <Link href={`/${recommended.senderId}`}>
                      <Image
                        borderRadius="full"
                        src={recommended.senderProfile?.image}
                        boxSize="40px"
                        mr="5px"
                      />
                    </Link>
                    <Stack>
                      <Link href={`/${recommended.senderId}`} _hover={{ textDecor: 'none' }}>
                        <Text fontSize={['10px', '11px']} >
                          {recommended.senderProfile?.name}
                        </Text>
                      </Link>
                      <Text fontSize={['9px', '10px']} opacity={0.6}>
                        {timeSince(recommended.createdAt)}
                      </Text>
                    </Stack>
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
