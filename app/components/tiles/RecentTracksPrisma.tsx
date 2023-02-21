import { useParams } from '@remix-run/react';
import { useState, useCallback } from 'react';

import { Box, SimpleGrid, Stack } from '@chakra-ui/react';

import type { RecentSongs, Track } from '@prisma/client';

import ExpandedSongs from '../profile/ExpandedSongs';
import Tile from '../Tile';
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

  if (!recent.length) return null;

  return (
    <>
      <Stack spacing={3}>
        <Tiles title={title} scrollButtons={scrollButtons} setShow={setShow}>
          {recent.map(({ track }, index) => {
            return <Tile key={index} track={track} profileId={id ?? ''} />;
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
                return (
                  <Box key={index}>
                    <Tile track={track} profileId={id ?? ''} w={['115px', '100px']} />
                  </Box>
                );
              })}
            </SimpleGrid>
          ) : (
            recent.map(({ track }, index) => {
              return <Card key={index} track={track} userId={id ?? ''} />;
            })
          )}
        </ExpandedSongs>
      </Stack>
    </>
  );
};

export default RecentTracksPrisma;
