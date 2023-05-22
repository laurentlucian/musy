import { useParams } from '@remix-run/react';
import { useState, useCallback } from 'react';

import { Box, SimpleGrid, Stack } from '@chakra-ui/react';

import type { RecentSongs, Track } from '@prisma/client';

import { useExpandedActions } from '~/hooks/useExpandedTileState';
import { useExpandedStack, useSetExpandedStack } from '~/hooks/useOverlay';

import Card from './Card';
import ExpandedSongs from './ExpandedSongs';
import Tile from './tile/Tile';
import TileImage from './tile/TileImage';
import TileInfo from './tile/TileInfo';
import Tiles from './Tiles';

const RecentTracks = ({
  recent,
}: {
  recent: (RecentSongs & {
    track: Track & {};
  })[];
}) => {
  const [layout, setLayout] = useState(true);
  const [show, setShow] = useState(false);
  const scrollButtons = recent.length > 5;
  const { id } = useParams();
  const { removeFromStack } = useSetExpandedStack();
  const stack = useExpandedStack();
  const { onClose: closeTile } = useExpandedActions();

  const onClose = useCallback(() => {
    if (stack?.includes(1)) {
      closeTile();
      removeFromStack(1);
    } else {
      removeFromStack(0);
      setShow(false);
    }
  }, [setShow, closeTile, stack, removeFromStack]);
  const title = 'Recent';

  const tracks = recent.map((data) => data.track);

  if (!recent.length) return null;

  return (
    <>
      <Stack spacing={3}>
        <Tiles title={title} scrollButtons={scrollButtons} setShow={setShow}>
          {recent.map(({ track }, index) => {
            const layoutKey = 'RecentPrisma' + index;
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
              {recent.map(({ track }, index) => {
                const layoutKey = 'RecentPrismaExpanded' + index;
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
            recent.map(({ track }, index) => {
              return (
                <Card
                  key={index}
                  layoutKey={'RecentPrismaCard' + index}
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
    </>
  );
};

export default RecentTracks;
