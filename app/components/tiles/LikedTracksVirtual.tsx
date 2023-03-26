import { useFetcher, useParams } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';

import { Box, Flex, Heading, HStack, IconButton, Stack } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowLeft2, ArrowRight2, Next, Previous } from 'iconsax-react';

import { useMouseScroll } from '~/hooks/useMouseScroll';

import Tile from '../tile/Tile';

const LikedTracksVirtual = ({
  liked: initialLiked,
}: {
  currentUser: Profile | null;
  liked: SpotifyApi.SavedTrackObject[];
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const { id } = useParams();
  const fetcher = useFetcher();
  const offsetRef = useRef(0);
  const { props, scrollRef } = useMouseScroll('reverse', false);
  const hasFetched = useRef(false);
  const { getVirtualItems, scrollToIndex, ...rowVirtualizer } = useVirtualizer({
    count: liked.length,
    estimateSize: () => 210,
    getScrollElement: () => scrollRef.current,
    horizontal: true,
    overscan: 5,
  });
  const virtualItems = getVirtualItems();

  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse();

    if (lastItem.index >= liked.length - 15 && !hasFetched.current) {
      const newOffset = offsetRef.current + 50;
      offsetRef.current = newOffset;
      fetcher.load(`/${id}/liked?offset=${newOffset}`);
      hasFetched.current = true;
    }
  }, [virtualItems, liked.length, fetcher, id]);

  useEffect(() => {
    if (fetcher.data) {
      setLiked((prev) => [...prev, ...fetcher.data]);
      hasFetched.current = false;
    }
  }, [fetcher.data]);

  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  if (!liked) return null;

  return (
    <Stack spacing={3}>
      <HStack position="relative" spacing={5} align="center">
        <Heading fontSize={['xs', 'sm']}>Virtual Liked</Heading>

        <HStack ml="auto !important">
          <HStack>
            <IconButton
              // scrollToIndex works here as expected here
              onClick={() => scrollToIndex(0)}
              variant="ghost"
              icon={<Previous size="15px" />}
              aria-label="to start"
              _hover={{ color: 'spotify.green', opacity: 1 }}
              opacity={0.5}
              _active={{ boxShadow: 'none' }}
            />

            <IconButton
              isDisabled
              // bug -> scrollToIndex isn't scrolling to expected index, but it's still moving in the expected direction
              onClick={() =>
                scrollToIndex(virtualItems[0].index - 8, { align: 'start', behavior: 'smooth' })
              }
              variant="ghost"
              icon={<ArrowLeft2 size="15px" />}
              aria-label="previous page"
              _hover={{ color: 'spotify.green', opacity: 1 }}
              opacity={0.5}
              _active={{ boxShadow: 'none' }}
            />
          </HStack>

          <HStack>
            <IconButton
              isDisabled
              onClick={() => {
                // bug -> same as above
                scrollToIndex(virtualItems[virtualItems.length - 1].index + 8, {
                  align: 'end',
                  behavior: 'smooth',
                });
              }}
              variant="ghost"
              icon={<ArrowRight2 size="15px" />}
              aria-label="next page"
              _hover={{ color: 'spotify.green', opacity: 1 }}
              opacity={0.5}
              _active={{ boxShadow: 'none' }}
            />

            <IconButton
              isDisabled
              onClick={() => {
                // bug -> scrollToIndex isn't scrolling to the end
                scrollToIndex(50, { align: 'end' });
              }}
              variant="ghost"
              icon={<Next size="15px" />}
              aria-label="to end"
              _hover={{ color: 'spotify.green', opacity: 1 }}
              opacity={0.5}
              _active={{ boxShadow: 'none' }}
            />
          </HStack>
        </HStack>
      </HStack>
      <Flex
        ref={scrollRef}
        // scrollbar of container isn't accurate to width of children; glitchy
        className="scrollbar"
        overflow="auto"
        align="flex-start"
        pb={2}
        position="relative"
        h="265px"
        {...props}
      >
        <Box h="100%" w={`${rowVirtualizer.getTotalSize()}px`} pos="relative">
          {virtualItems.map((virtualRow) => {
            // const { track } = liked[virtualRow.index];

            return (
              // <Tile
              //   pos="absolute"
              //   top="0"
              //   left="0"
              //   height="100%"
              //   width={`${virtualRow.size}px`}
              //   transform={`translateX(${virtualRow.start}px)`}
              //   key={virtualRow.index}
              //   // track={{
              //   //   albumName: track.album.name,
              //   //   albumUri: track.album.uri,
              //   //   artist: track.artists[0].name,
              //   //   artistUri: track.artists[0].uri,
              //   //   duration: track.duration_ms,
              //   //   explicit: track.explicit,
              //   //   id: track.id,
              //   //   image: track.album.images[1].url,
              //   //   link: track.external_urls.spotify,
              //   //   name: track.name,
              //   //   preview_url: track.preview_url,
              //   //   uri: track.uri,
              //   // }}
              // />
              <></>
            );
          })}
        </Box>
      </Flex>
    </Stack>
  );
};

export default LikedTracksVirtual;
