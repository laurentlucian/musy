import { Stack } from '@chakra-ui/react';
import { useFetcher, useParams } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import useIsVisible from '~/hooks/useIsVisible';
import Tile from '../Tile';
import Tiles from '../Tiles';

const Playlists = ({
  playlists: initialPlaylists,
}: {
  playlists: SpotifyApi.PlaylistObjectSimplified[];
}) => {
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const { id } = useParams();

  const fetcher = useFetcher();
  const offsetRef = useRef(0);
  const [setRef, isVisible] = useIsVisible();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (isVisible && !hasFetched.current) {
      const newOffset = offsetRef.current + 50;
      offsetRef.current = newOffset;
      fetcher.load(`/${id}/playlists?offset=${newOffset}`);
      hasFetched.current = true;
    }
  }, [isVisible, fetcher, id]);

  useEffect(() => {
    if (fetcher.data) {
      setPlaylists((prev) => [...prev, ...fetcher.data]);
      hasFetched.current = false;
    }
  }, [fetcher.data]);

  useEffect(() => {
    setPlaylists(initialPlaylists);
  }, [initialPlaylists]);

  if (!playlists) return null;

  return (
    <Stack spacing={3}>
      <Tiles title="Playlists" scrollButtons>
        {playlists.map((list, index) => {
          const isLast = index === playlists.length - 1;

          return (
            <Tile
              ref={(node) => {
                isLast && setRef(node);
              }}
              playlist
              key={list.id}
              uri={list.uri}
              image={list.images[0]?.url}
              albumUri={list.uri}
              albumName={list.name}
              name={list.name}
              artist={list.description}
              artistUri={null}
              explicit={false}
            />
          );
        })}
      </Tiles>
    </Stack>
  );
};

export default Playlists;
