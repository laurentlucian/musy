import { useParams } from '@remix-run/react';
import { useState, useCallback } from 'react';

import { Box, SimpleGrid, Stack } from '@chakra-ui/react';

import { useFullscreenActions } from '~/hooks/useFullscreenTileStore';
import { useFullscreenStack, useSetExpandedStack } from '~/hooks/useOverlay';
import type { TrackWithInfo } from '~/lib/types/types';

import Card from './Card';
import ExpandedSongs from './ExpandedSongs';
import Tile from './tile/Tile';
import TileImage from './tile/TileImage';
import TileInfo from './tile/TileInfo';
import Tiles from './Tiles';

const TrackTiles = ({ title, tracks }: { title: string; tracks: TrackWithInfo[] }) => {
  const [layout, setLayout] = useState(true);
  const [show, setShow] = useState(false);
  const scrollButtons = tracks.length > 5;
  const { id } = useParams();
  const { removeFromStack } = useSetExpandedStack();
  const stack = useFullscreenStack();
  const { onClose: closeTile } = useFullscreenActions();

  const onClose = useCallback(() => {
    if (stack?.includes(1)) {
      closeTile();
      removeFromStack(1);
    } else {
      removeFromStack(0);
      setShow(false);
    }
  }, [setShow, closeTile, stack, removeFromStack]);

  if (!tracks.length) return null;

  return (
    <Stack spacing={3}>
      <Tiles title={title} scrollButtons={scrollButtons} setShow={setShow}>
        {tracks.map((track, index) => {
          const layoutKey = title + index;
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
              const layoutKey = title + 'Expanded' + index;
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
                layoutKey={title + 'Card' + index}
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

export default TrackTiles;
