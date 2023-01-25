import { useFetcher, useParams } from '@remix-run/react';
import { useState, useEffect, useRef } from 'react';
import useIsVisible from '~/hooks/useIsVisible';

export function usePlaylists(initialPlaylists: SpotifyApi.PlaylistObjectSimplified[]) {
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [show, setShow] = useState(false);
  const { id } = useParams();

  const { data, load } = useFetcher();
  const offsetRef = useRef(0);
  const [setRef, isVisible] = useIsVisible();
  const hasFetched = useRef(false);

  useEffect(() => {
    const isDataLessThan50 = data ? data.length < 50 : true; // true if data is undefined
    if (isVisible && !hasFetched.current && !isDataLessThan50) {
      const newOffset = offsetRef.current + 50;
      offsetRef.current = newOffset;
      load(`/${id}/playlists?offset=${newOffset}`);
      hasFetched.current = true;
    }
  }, [isVisible, load, id, data]);

  useEffect(() => {
    if (data) {
      setPlaylists((prev) => [...prev, ...data]);
      hasFetched.current = false;
    }
  }, [data]);

  useEffect(() => {
    setPlaylists(initialPlaylists);
  }, [initialPlaylists]);

  return { playlists, show, setShow, setRef };
}
