import { useParams } from '@remix-run/react';
import { useState, useCallback } from 'react';

import { Box, SimpleGrid, Stack } from '@chakra-ui/react';

import type { Track } from '~/lib/types/types';

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

  const tracks: Track[] = [];
  for (let i = 0; i < recent.length; i++) {
    const track = {
      albumName: recent[i].track.album.name,
      albumUri: recent[i].track.album.uri,
      artist: recent[i].track.artists[0].name,
      artistUri: recent[i].track.artists[0].uri,
      duration: recent[i].track.duration_ms,
      explicit: recent[i].track.explicit,
      id: recent[i].track.id,
      image: recent[i].track.album.images[0]?.url,
      link: recent[i].track.external_urls.spotify,
      name: recent[i].track.name,
      preview_url: recent[i].track.preview_url,
      uri: recent[i].track.uri,
    };
    tracks.push(track);
  }

  return (
    <Stack spacing={3}>
      <Tiles title={title} scrollButtons={scrollButtons} setShow={setShow}>
        {recent.map(({ played_at, track }, index) => {
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
              tracks={tracks}
              index={index}
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
            {recent.map(({ played_at, track }, index) => {
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
                    tracks={tracks}
                    index={index}
                    profileId={id ?? ''}
                    w={['115px', '100px']}
                  />
                </Box>
              );
            })}
          </SimpleGrid>
        ) : (
          recent.map(({ played_at, track }, index) => {
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
                tracks={tracks}
                index={index}
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
