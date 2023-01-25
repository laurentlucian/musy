import { useFetcher, useParams } from '@remix-run/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import useIsVisible from '~/hooks/useIsVisible';
import ExpandedSongs from '../ExpandedSongs';
import PlaylistTile from '../PlaylistTile';
import PlaylistCard from './PlaylistCard';
import { Stack } from '@chakra-ui/react';
import Tiles from './Tiles';

const Playlists = ({
  playlists: initialPlaylists,
}: {
  playlists: SpotifyApi.PlaylistObjectSimplified[];
}) => {
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

  const onClose = useCallback(() => {
    setShow(false);
  }, [setShow]);

  if (!playlists) return null;
  const scrollButtons = playlists.length > 5;
  const title = 'Playlists';
  return (
    <Stack spacing={3}>
      <Tiles title={title} scrollButtons={scrollButtons} setShow={setShow}>
        {playlists.map((list, index) => {
          const isLast = index === playlists.length - 1;

          return (
            <PlaylistTile
              ref={(node) => {
                isLast && setRef(node);
              }}
              key={list.id}
              uri={list.uri}
              image={list.images[0]?.url}
              name={list.name}
              tracks={list.tracks.total}
              description={list.description}
            />
          );
        })}
      </Tiles>
      {scrollButtons && (
        <ExpandedSongs title={title} show={show} onClose={onClose}>
          {playlists.map((list, index) => {
            const isLast = index === playlists.length - 1;
            return (
              <PlaylistCard
                ref={(node) => {
                  isLast && setRef(node);
                }}
                key={list.id}
                uri={list.uri}
                image={list.images[0]?.url}
                playlistUri={list.uri}
                name={list.name}
                description={list.description}
              />
            );
          })}
        </ExpandedSongs>
      )}
    </Stack>
  );
};

export default Playlists;
