import { Stack, Text } from '@chakra-ui/react';
import type { Profile, RecommendedSongs } from '@prisma/client';
import Tile from '../Tile';
import Tiles from './Tiles';

interface RecommendedProps extends RecommendedSongs {
  senderProfile?: Profile;
}

const Recommended = ({ recommended }: { recommended: RecommendedProps[] }) => {
  const scrollButtons = recommended.length > 5;
  const show = recommended.length > 0;
  const timeFormatter = new Intl.RelativeTimeFormat();

  return (
    <>
      {show && (
        <Stack spacing={3}>
          <Tiles title="Recommended" scrollButtons={scrollButtons}>
            {recommended.map((recommended) => {
              const date = new Date();
              const currentTimestamp = date.getTime();
              const createdAt = new Date(recommended.createdAt);
              const createdAtTimestamp = createdAt.getTime();
              const diffTimestamp = currentTimestamp - createdAtTimestamp;

              const diffSeconds = Math.floor(diffTimestamp / 1000);
              const diffMinutes = Math.floor(diffSeconds / 60);
              const diffHours = Math.floor(diffMinutes / 60);
              const diffDays = Math.floor(diffHours / 24);
              const diffWeeks = Math.floor(diffDays / 7);
              const diffMonths = Math.floor(diffWeeks / 4);

              let timePassed = '';
              if (diffSeconds < 60) {
                timePassed = timeFormatter.format(-diffSeconds, 'seconds');
              } else if (diffMinutes < 60) {
                timePassed = timeFormatter.format(-diffMinutes, 'minutes');
              } else if (diffHours < 24) {
                timePassed = timeFormatter.format(-diffHours, 'hours');
              } else if (diffDays < 7) {
                timePassed = timeFormatter.format(-diffDays, 'days');
              } else if (diffWeeks < 4) {
                timePassed = timeFormatter.format(-diffWeeks, 'weeks');
              } else {
                timePassed = timeFormatter.format(-diffMonths, 'months');
              }
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
                    recommend={show}
                    // recommendedBy={recommended.senderProfile}
                  />
                  <Text fontSize={['xs', 's']}>{timePassed}</Text>
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
