import { useFetcher, useParams } from '@remix-run/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Box, SimpleGrid, Stack } from '@chakra-ui/react';

import useIsVisible from '~/hooks/useIsVisible';
import type { Track } from '~/lib/types/types';

import ExpandedSongs from '../profile/ExpandedSongs';
import Tile from '../Tile';
import TileImage from '../TileImage';
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

  if (!liked) return null;
  const scrollButtons = liked.length > 5;
  const title = 'Liked';

  const tracks: Track[] = [];
  for (let i = 0; i < liked.length; i++) {
    const track = {
      albumName: liked[i].track.album.name,
      albumUri: liked[i].track.album.uri,
      artist: liked[i].track.artists[0].name,
      artistUri: liked[i].track.artists[0].uri,
      duration: liked[i].track.duration_ms,
      explicit: liked[i].track.explicit,
      id: liked[i].track.id,
      image: liked[i].track.album.images[0]?.url,
      link: liked[i].track.external_urls.spotify,
      name: liked[i].track.name,
      preview_url: liked[i].track.preview_url,
      uri: liked[i].track.uri,
    };
    tracks.push(track);
  }

  return (
    <Stack spacing={3}>
      <Tiles title={title} scrollButtons={scrollButtons} setShow={setShow}>
        {liked.map(({ track }, index) => {
          const isLast = index === liked.length - 1;
          const song = {
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
          };
          return (
            <Tile
              ref={(node) => {
                isLast && setRef(node);
              }}
              key={track.id}
              layoutKey="LikedTracks"
              track={song}
              profileId={id ?? ''}
              tracks={tracks}
              index={index}
              image={
                <TileImage
                  src={song.image}
                  index={index}
                  layoutKey={'RecentExpanded' + index}
                  track={song}
                  tracks={tracks}
                />
              }
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
            {liked.map(({ track }, index) => {
              const song = {
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
              };
              return (
                <Box key={index}>
                  <Tile
                    layoutKey="LikedExpanded"
                    track={song}
                    profileId={id ?? ''}
                    tracks={tracks}
                    index={index}
                    image={
                      <TileImage
                        src={song.image}
                        index={index}
                        layoutKey={'RecentExpanded' + index}
                        track={song}
                        tracks={tracks}
                        size={['115px', '100px']}
                      />
                    }
                  />
                </Box>
              );
            })}
          </SimpleGrid>
        ) : (
          liked.map(({ track }, index) => {
            const isLast = index === liked.length - 1;
            return (
              <Card
                ref={(node: HTMLDivElement | null) => {
                  isLast && setRef(node);
                }}
                key={track.id}
                layoutKey="LikedCard"
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
