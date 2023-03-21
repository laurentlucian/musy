import { useParams } from '@remix-run/react';
import { useState, useCallback, useMemo } from 'react';

import { Box, SimpleGrid, Stack } from '@chakra-ui/react';

import type { Track } from '~/lib/types/types';

import ExpandedSongs from '../profile/ExpandedSongs';
import Tile from '../Tile';
import TileImage from '../TileImage';
import TileInfo from '../TileInfo';
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

  const tracks: Track[] = useMemo(() => {
    return recent.map((item) => {
      return {
        albumName: item.track.album.name,
        albumUri: item.track.album.uri,
        artist: item.track.artists[0].name,
        artistUri: item.track.artists[0].uri,
        duration: item.track.duration_ms,
        explicit: item.track.explicit,
        id: item.track.id,
        image: item.track.album.images[0].url,
        link: item.track.external_urls.spotify,
        name: item.track.name,
        preview_url: item.track.preview_url ?? '',
        uri: item.track.uri,
      };
    });
  }, [recent]);
  return (
    <Stack spacing={3}>
      <Tiles title={title} scrollButtons={scrollButtons} setShow={setShow}>
        {recent.map(({ played_at, track }, index) => {
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
          const layoutKey = 'Recent' + index;
          return (
            <Tile
              key={played_at}
              track={song}
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
            {recent.map(({ played_at, track }, index) => {
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
              const layoutKey = 'RecentExpanded' + index;
              return (
                <Box key={played_at}>
                  <Tile
                    track={song}
                    tracks={tracks}
                    index={index}
                    layoutKey={layoutKey}
                    image={<TileImage size={['115px', '100px']} />}
                    info={<TileInfo />}
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
                layoutKey={'RecentCard' + index}
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
