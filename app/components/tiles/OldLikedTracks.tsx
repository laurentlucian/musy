import { useFetcher, useParams } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';

import { Stack } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';

import useOldIsVisible from '~/hooks/useOldIsVisible';

import Tile from '../Tile';
import Tiles from './Tiles';

const OldLikedSongs = ({
  liked: initialLiked,
}: {
  currentUser: Profile | null;
  liked: SpotifyApi.SavedTrackObject[];
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const { id } = useParams();
  const fetcher = useFetcher();
  const offsetRef = useRef(0);
  const ref = useRef(null);
  const isVisible = useOldIsVisible(ref);
  const hasFetched = useRef(false);
  useEffect(() => {
    if (isVisible && !hasFetched.current) {
      const newOffset = offsetRef.current + 50;
      offsetRef.current = newOffset;
      fetcher.load(`/${id}/liked?offset=${newOffset}`);
      hasFetched.current = true;
    }
  }, [isVisible, fetcher, id]);
  useEffect(() => {
    if (fetcher.data) {
      setLiked((prev) => [...prev, ...fetcher.data]);
      hasFetched.current = false;
    }
  }, [fetcher.data]);
  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);
  if (!liked) return null;

  return (
    <Stack spacing={3}>
      <Tiles title="Old Liked" scrollButtons={true}>
        {liked.map(({ track }) => {
          return (
            <Tile
              key={track.id}
              layoutKey="OldLiked"
              track={{
                albumName: track.album.name,
                albumUri: track.album.uri,
                artist: track.artists[0].name,
                artistUri: track.artists[0].uri,
                duration: track.duration_ms,
                explicit: track.explicit,
                id: track.id,
                image: track.album.images[1].url,
                link: track.external_urls.spotify,
                name: track.name,
                preview_url: track.preview_url,
                uri: track.uri,
              }}
            />
          );
        })}
        <div ref={ref} style={{ border: '100px solid', opacity: 0 }} />
      </Tiles>
    </Stack>
  );
};
export default OldLikedSongs;
