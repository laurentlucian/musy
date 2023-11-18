import { useSearchParams } from '@remix-run/react';
import { useEffect } from 'react';

import { Stack } from '@chakra-ui/react';

import { useTypedFetcher } from 'remix-typedjson';

import TileTrackImage from '~/components/tile/track/TileTrackImage';
import TileTrackList from '~/components/tile/track/TileTrackList';
import type { loader } from '~/routes/api+/search+/results';

import SendButton from '../shared/actions/SendTrack';

const FullscreenQueueTracks = ({ userId }: { userId: string }) => {
  const [searchParams] = useSearchParams();
  const { data, load } = useTypedFetcher<typeof loader | undefined>();
  const search = searchParams.get('fullscreen');
  useEffect(() => {
    if (search) {
      load(`/api/search/results?fullscreen=${search}&param=fullscreen`);
    }
  }, [search, load]);

  const tracks = search ? data?.tracks ?? [] : [];

  return (
    <Stack spacing={5} pr="10px">
      {tracks.map((track) => {
        return (
          <TileTrackList
            key={track.id}
            track={track}
            image={
              <TileTrackImage
                fullscreen={{
                  track: track,
                }}
                box={{ w: ['75px', '90px'] }}
                image={{
                  src: track.image,
                }}
              />
            }
            action={<SendButton trackId={track.id} userId={userId} />}
          />
        );
      })}
    </Stack>
  );
};

export default FullscreenQueueTracks;
