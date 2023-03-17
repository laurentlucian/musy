import { useFetcher, useParams } from '@remix-run/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Box, SimpleGrid, Stack } from '@chakra-ui/react';

import type { LikedSongs } from '@prisma/client';
import type { Track } from '@prisma/client';

import useIsVisible from '~/hooks/useIsVisible';

import ExpandedSongs from '../profile/ExpandedSongs';
import Tile from '../Tile';
import TileImage from '../TileImage';
import TileInfo from '../TileInfo';
import Card from './Card';
import Tiles from './Tiles';

const LikedTracksPrisma = ({
  liked: initialLiked,
}: {
  liked: (LikedSongs & {
    track: Track & {};
  })[];
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [layout, setLayout] = useState(true);
  const [show, setShow] = useState(false);
  const { id } = useParams();

  const fetcher = useFetcher();
  // const offsetRef = useRef(0);
  const [setRef, isVisible] = useIsVisible();
  const hasFetched = useRef(false);

  useEffect(() => {
    // @todo implement infinite scroll with prisma
    if (isVisible && !hasFetched.current) {
      // const newOffset = offsetRef.current + 50;
      // offsetRef.current = newOffset;
      // fetcher.load(`/${id}/liked?offset=${newOffset}`);
      // hasFetched.current = true;
    }
  }, [isVisible, fetcher, id]);

  useEffect(() => {
    if (fetcher.data) {
      // setLiked((prev) => [...prev, ...fetcher.data]);
      // hasFetched.current = false;
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

  const tracks = liked.map((data) => data.track);

  if (!liked.length) return null;
  return (
    <Stack spacing={3}>
      <Tiles title={title} scrollButtons={scrollButtons} setShow={setShow}>
        {liked.map(({ track }, index) => {
          const isLast = index === liked.length - 1;
          return (
            <Tile
              layoutKey="LikedPrisma"
              ref={(node) => {
                isLast && setRef(node);
              }}
              key={track.id}
              track={track}
              image={
                <TileImage
                  src={track.image}
                  index={index}
                  layoutKey={'LikedPrisma' + index}
                  track={track}
                  tracks={tracks}
                />
              }
              info={
                <TileInfo
                  index={index}
                  layoutKey={'LikedPrisma' + index}
                  track={track}
                  tracks={tracks}
                  profileId={id}
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
              return (
                <Box key={index}>
                  <Tile
                    layoutKey="LikedPrismaExpanded"
                    track={track}
                    image={
                      <TileImage
                        src={track.image}
                        index={index}
                        layoutKey={'LikedPrismaExpanded' + index}
                        track={track}
                        tracks={tracks}
                        size={['115px', '100px']}
                      />
                    }
                    info={
                      <TileInfo
                        index={index}
                        layoutKey={'LikedPrismaExpanded' + index}
                        track={track}
                        tracks={tracks}
                        profileId={id}
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
                layoutKey="LikedPrismaCard"
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

export default LikedTracksPrisma;
