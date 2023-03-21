import { useFetcher, useParams } from '@remix-run/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, SimpleGrid, Stack } from '@chakra-ui/react';

import useIsVisible from '~/hooks/useIsVisible';
import type { Track } from '~/lib/types/types';

import ExpandedSongs from '../profile/ExpandedSongs';
import Tile from '../Tile';
import TileImage from '../TileImage';
import TileInfo from '../TileInfo';
import Card from './Card';
import Tiles from './Tiles';

const LikedTracks = ({ liked: initialLiked }: { liked: SpotifyApi.SavedTrackObject[] }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [layout, setLayout] = useState(true);
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

  const tracks: Track[] = useMemo(() => {
    return liked.map((item) => {
      return {
        albumName: item.track.album.name,
        albumUri: item.track.album.uri,
        artist: item.track.artists[0].name,
        artistUri: item.track.artists[0].uri,
        duration: item.track.duration_ms,
        explicit: item.track.explicit,
        id: item.track.id,
        image: item.track.album.images[0]?.url,
        link: item.track.external_urls.spotify,
        name: item.track.name,
        preview_url: item.track.preview_url ?? '',
        uri: item.track.uri,
      };
    });
  }, [liked]);

  if (!liked) return null;
  const scrollButtons = liked.length > 5;
  const title = 'Liked';

  const layoutKey = 'LikedTracks';
  return (
    <Stack spacing={3}>
      <Tiles title={title} scrollButtons={scrollButtons} setShow={setShow}>
        {tracks.map((track, index) => {
          const isLast = index === tracks.length - 1;
          return (
            <Tile
              ref={(node) => {
                isLast && setRef(node);
              }}
              key={track.id}
              track={track}
              tracks={tracks}
              index={index}
              layoutKey={layoutKey}
              image={<TileImage />}
              info={<TileInfo />}
            />
          );
        })}
      </Tiles>
      <ExpandedSongs
        title={title}
        show={show}
        onClose={onClose}
        setLayout={setLayout}
        layout={layout}
      >
        {layout ? (
          <SimpleGrid
            minChildWidth={['115px', '100px']}
            spacing="10px"
            w={{ base: '100vw', md: '750px', sm: '450px', xl: '1100px' }}
          >
            {tracks.map((track, index) => {
              return (
                <Box key={index}>
                  <Tile
                    track={track}
                    tracks={tracks}
                    index={index}
                    layoutKey="LikedExpanded"
                    image={<TileImage size={['115px', '100px']} />}
                    info={<TileInfo />}
                  />
                </Box>
              );
            })}
          </SimpleGrid>
        ) : (
          tracks.map((track, index) => {
            const isLast = index === tracks.length - 1;
            return (
              <Card
                ref={(node: HTMLDivElement | null) => {
                  isLast && setRef(node);
                }}
                key={track.id}
                layoutKey="LikedCard"
                track={track}
                userId={id ?? ''}
                tracks={tracks}
                index={index}
              />
            );
          })
        )}
      </ExpandedSongs>
    </Stack>
  );
};

export default LikedTracks;
