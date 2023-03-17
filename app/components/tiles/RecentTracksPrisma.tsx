import { useParams } from '@remix-run/react';
import { useState, useCallback } from 'react';

import { Box, SimpleGrid, Stack } from '@chakra-ui/react';

import type { RecentSongs, Track } from '@prisma/client';

import ExpandedSongs from '../profile/ExpandedSongs';
import Tile from '../Tile';
import TileImage from '../TileImage';
import TileInfo from '../TileInfo';
import Card from './Card';
import Tiles from './Tiles';

const RecentTracksPrisma = ({
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

  const onClose = useCallback(() => {
    setShow(false);
  }, [setShow]);
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
                image={
                  <TileImage
                    src={track.image}
                    index={index}
                    layoutKey={'RecentPrisma11' + index}
                    track={track}
                    tracks={tracks}
                  />
                }
                info={
                  <TileInfo index={index} layoutKey={layoutKey} track={track} tracks={tracks} />
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
              {recent.map(({ track }, index) => {
                const layoutKey = 'RecentPrismaExpanded' + index;
                return (
                  <Box key={index}>
                    <Tile
                      image={
                        <TileImage
                          src={track.image}
                          index={index}
                          layoutKey={layoutKey}
                          track={track}
                          tracks={tracks}
                          size={['115px', '100px']}
                        />
                      }
                      info={
                        <TileInfo
                          index={index}
                          layoutKey={layoutKey}
                          track={track}
                          tracks={tracks}
                        />
                      }
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

export default RecentTracksPrisma;
