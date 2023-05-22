import { useParams } from '@remix-run/react';
import { useState, useCallback } from 'react';

import { Box, SimpleGrid, Stack } from '@chakra-ui/react';

import type { Track } from '~/lib/types/types';

import Card from '../../Card';
import ExpandedSongs from '../../ExpandedSongs';
import Tiles from '../../Tiles';
import Tile from '../Tile';
import TileImage from '../TileImage';
import TileInfo from '../TileInfo';

const RecentTracks = ({ recent }: { recent: SpotifyApi.PlayHistoryObject[] }) => {
  const [layout, setLayout] = useState(true);
  const [show, setShow] = useState(false);
  const scrollButtons = recent.length > 5;
  const { id } = useParams();

  const onClose = useCallback(() => {
    setShow(false);
  }, [setShow]);
  const title = 'Recent';

  const tracks: Track[] = recent.map((item) => {
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

  return (
    <Stack spacing={3}>
      <Tiles title={title} scrollButtons={scrollButtons} setShow={setShow}>
        {tracks.map((track, index) => {
          const layoutKey = 'Recent' + index;
          return (
            <Tile
              key={index}
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
              const layoutKey = 'RecentExpanded' + index;
              return (
                <Box key={index}>
                  <Tile
                    track={track}
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
          tracks.map((track, index) => {
            return (
              <Card
                key={index}
                layoutKey={'RecentCard' + index}
                track={track}
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
