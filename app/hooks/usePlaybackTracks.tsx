import { useEffect } from 'react';

import { useTypedFetcher } from 'remix-typedjson';

import type { ProfileWithInfo } from '~/lib/types/types';
import type { loader } from '~/routes/api+/playback+/$playbackId';

const usePlaybackTracks = (user: ProfileWithInfo) => {
  const { data, load } = useTypedFetcher<typeof loader | undefined>();

  useEffect(() => {
    if (user.playback) {
      load(`/api/playback/active/${user.userId}`);
    } else {
      load(`/api/playback/${user.playbacks[0].id}`);
    }
  }, [load, user]);

  return data?.tracks;
};

export default usePlaybackTracks;
