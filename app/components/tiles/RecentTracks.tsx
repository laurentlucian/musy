import { useParams } from '@remix-run/react';
import { useState, useCallback } from 'react';

import { Box, SimpleGrid, Stack } from '@chakra-ui/react';

import ExpandedSongs from '../profile/ExpandedSongs';
import Tile from '../Tile';
import Card from './Card';
import Tiles from './Tiles';

const RecentTracks = ({ recent }: { recent: SpotifyApi.PlayHistoryObject[] }) => {
  const [layout, setLayout] = useState(true);
  const [show, setShow] = useState(false);
  const scrollButtons = recent.length > 5;
  const { id } = useParams();

  const onClose = useCallback(() => {
    setShow(false);
  }, [setShow]);
  const title = 'Recent';

  return (
    <Stack spacing={3}>
      <Tiles title={title} scrollButtons={scrollButtons} setShow={setShow}>
        {recent.map(({ played_at, track }) => {
          return (
            <Tile
              key={played_at}
              layoutKey="Recent"
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
            {recent.map(({ played_at, track }) => {
              return (
                <Box key={played_at}>
                  <Tile
                    layoutKey="RecentExpanded"
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
                    w={['115px', '100px']}
                  />
                </Box>
              );
            })}
          </SimpleGrid>
        ) : (
          recent.map(({ played_at, track }) => {
            return (
              <Card
                key={played_at}
                layoutKey="RecentCard"
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
          })
        )}
      </ExpandedSongs>
    </Stack>
  );
};

export default RecentTracks;
