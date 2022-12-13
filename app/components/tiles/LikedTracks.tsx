import { Heading, Stack } from '@chakra-ui/react';
import { useFetcher, useParams } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import useIsVisible from '~/hooks/useIsVisible';
import Tile from '../Tile';
import Tiles from '../Tiles';

const LikedTracks = ({ liked: initialLiked }: { liked: SpotifyApi.SavedTrackObject[] }) => {
  const [liked, setLiked] = useState(initialLiked);
  const { id } = useParams();

  const fetcher = useFetcher();
  const offsetRef = useRef(0);
  const ref = useRef(null);
  const isVisible = useIsVisible(ref);
  const hasFetched = useRef(false);
  console.log(isVisible);
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
      <Heading fontSize={['xs', 'sm']}>Liked</Heading>
      <Tiles>
        {liked.map(({ track }) => {
          return (
            <Tile
              key={track.id}
              uri={track.uri}
              image={track.album.images[1].url}
              albumUri={track.album.uri}
              albumName={track.album.name}
              name={track.name}
              artist={track.album.artists[0].name}
              artistUri={track.album.artists[0].uri}
              explicit={track.explicit}
              user={null}
            />
          );
        })}
        <div ref={ref} style={{ border: '100px solid', opacity: 0 }} />
      </Tiles>
    </Stack>
  );
};

export default LikedTracks;
