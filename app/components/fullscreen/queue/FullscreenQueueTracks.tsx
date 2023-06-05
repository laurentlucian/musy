import { useSearchParams } from '@remix-run/react';
import { useEffect } from 'react';

import { Stack } from '@chakra-ui/react';

import { useTypedFetcher } from 'remix-typedjson';

import HTile from '~/components/tile/track/TileTrackList';
import type { loader } from '~/routes/api/search/results';

import SendButton from '../shared/actions/SendTrack';

const FullscreenQueueTracks = ({ userId }: { userId: string }) => {
  const [searchParams] = useSearchParams();
  const { data, load } = useTypedFetcher<typeof loader | undefined>();
  const search = searchParams.get('fullscreen');
  useEffect(() => {
    if (search) {
      load(`/api/search/results?fullscreen=${search}&search=fullscreen`);
    }
  }, [search, load]);

  const tracks = search ? data?.tracks ?? [] : [];

  return (
    <Stack spacing={5}>
      {tracks.map((track) => {
        return (
          <HTile
            key={track.id}
            track={track}
            userId={userId}
            action={<SendButton flexBasis="100px" trackId={track.id} userId={userId} />}
          />
        );
      })}
    </Stack>
  );
};

export default FullscreenQueueTracks;
