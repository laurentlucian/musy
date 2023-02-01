import { Image, Link, Stack, Text } from '@chakra-ui/react';

import type { Profile, RecommendedSongs } from '@prisma/client';
import { Minus } from 'iconsax-react';

import { timeSince } from '~/lib/utils';

import Tile from '../Tile';
import RecommendActions from './RecommendActions';
import Tiles from './Tiles';

// import RecommendActions from './RecommendActions';
type RecommendedProps = RecommendedSongs & {
  sender: Profile;
  senderProfile: Profile;
};

const Recommended = ({ recommended }: { recommended: RecommendedProps[] }) => {
  const scrollButtons = recommended.length > 5;
  const show = true;

  const testDummy = <Minus size="32" color="#f47373" />;

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
                    preview_url={recommended.preview_url} // old recommended tracks dont have preview url :(((
                    link={recommended.link}
                  />

                  <Stack direction="row">
                    <RecommendActions
                      recommendedBy={recommended.senderProfile}
                      trackId={recommended.trackId}
                    />
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
