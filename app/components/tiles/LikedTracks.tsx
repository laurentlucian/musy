import { useFetcher, useParams } from '@remix-run/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Stack } from '@chakra-ui/react';

import useIsVisible from '~/hooks/useIsVisible';

import ExpandedSongs from '../profile/ExpandedSongs';
import Tile from '../Tile';
import Card from './Card';
import Tiles from './Tiles';

const LikedTracks = ({ liked: initialLiked }: { liked: SpotifyApi.SavedTrackObject[] }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [show, setShow] = useState(false);
  const { id } = useParams();

  const fetcher = useFetcher();
  const offsetRef = useRef(0);
  const [setRef, isVisible] = useIsVisible();
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

  const onClose = useCallback(() => {
    setShow(false);
  }, [setShow]);

  if (!liked) return null;
  const scrollButtons = liked.length > 5;
  const title = 'Liked';

  return (
    <Stack spacing={3}>
      <Tiles title={title} scrollButtons={scrollButtons} setShow={setShow}>
        {liked.map(({ track }, index) => {
          const isLast = index === liked.length - 1;

          return (
            <Tile
              ref={(node) => {
                isLast && setRef(node);
              }}
              key={track.id}
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
              profileId={id ?? ''}
            />
          );
        })}
      </Tiles>
      <ExpandedSongs title={title} show={show} onClose={onClose}>
        {liked.map(({ track }, index) => {
          const isLast = index === liked.length - 1;
          return (
            <Card
              ref={(node: HTMLDivElement | null) => {
                isLast && setRef(node);
              }}
              key={track.id}
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
              userId={id ?? ''}
            />
          );
        })}
      </ExpandedSongs>
    </Stack>
  );
};

export default LikedTracks;
