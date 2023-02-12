import { useFetcher, useParams } from '@remix-run/react';
import { useEffect, useRef } from 'react';

import useIsVisible from '~/hooks/useIsVisible';
import { usePlaylistDrawerStore } from '~/hooks/usePlaylistDrawer';

const PlaylistTracks = () => {
  const playlist = usePlaylistDrawerStore();
  // const [trackz, setTracks] = useState<SpotifyApi.PlaylistTrackObject[] | undefined>(tracks);
  const [setRef, isVisible] = useIsVisible();
  const fetcher = useFetcher();
  const hasFetched = useRef(false);
  const offsetRef = useRef(0);
  const { id } = useParams();

  useEffect(() => {
    if (isVisible && !hasFetched.current) {
      const newOffset = offsetRef.current + 50;
      offsetRef.current = newOffset;
      fetcher.load(`/${id}/playlistTracks?playlistId=${playlist?.playlistId}&offset=${newOffset}`);
      hasFetched.current = true;
    }
  }, [isVisible, fetcher, id, playlist?.playlistId]);

  // useEffect(() => {
  //   if (fetcher.data) {
  //     setTracks((prev) => [...prev, ...fetcher.data]);
  //     hasFetched.current = false;
  //   }
  // }, [fetcher.data]);

  return <>{}</>;
};

export default PlaylistTracks;
