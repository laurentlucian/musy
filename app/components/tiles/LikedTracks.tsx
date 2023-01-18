import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Stack,
  useDisclosure,
} from '@chakra-ui/react';
import { useFetcher, useParams } from '@remix-run/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import useIsMobile from '~/hooks/useIsMobile';
import useIsVisible from '~/hooks/useIsVisible';
import Tiles from './Tiles';
import Tile from '../Tile';
import Card from '../Card';
import useDrawerBackButton from '~/hooks/useDrawerBackButton';

const LikedTracks = ({ liked: initialLiked }: { liked: SpotifyApi.SavedTrackObject[] }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [show, setShow] = useState(false);
  const { id } = useParams();

  const fetcher = useFetcher();
  const offsetRef = useRef(0);
  const [setRef, isVisible] = useIsVisible();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (isVisible && !hasFetched.current) {
      const newOffset = offsetRef.current + 50;
      offsetRef.current = newOffset;
      fetcher.load(`/${id}/liked?offset=${newOffset}`);
      hasFetched.current = true;
    }
  }, [isVisible, fetcher, id]);

  useEffect(() => {
    if (fetcher.data) {
      setLiked((prev) => [...prev, ...fetcher.data]);
      hasFetched.current = false;
    }
  }, [fetcher.data]);

  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  const isSmallScreen = useIsMobile();

  const onClose = useCallback(() => {
    setShow(false);
  }, [setShow]);

  useDrawerBackButton(onClose, show);

  const btnRef = useRef<HTMLButtonElement>(null);
  if (!liked) return null;
  const scrollButtons = liked.length > 5;

  return (
    <Stack spacing={3}>
      <Tiles title="Liked" scrollButtons={scrollButtons} setShow={setShow}>
        {liked.map(({ track }, index) => {
          const isLast = index === liked.length - 1;

          return (
            <Tile
              ref={(node) => {
                isLast && setRef(node);
              }}
              key={track.id}
              trackId={track.id}
              uri={track.uri}
              image={track.album.images[1].url}
              albumUri={track.album.uri}
              albumName={track.album.name}
              name={track.name}
              artist={track.album.artists[0].name}
              artistUri={track.album.artists[0].uri}
              explicit={track.explicit}
              preview_url={track.preview_url}
            />
          );
        })}
      </Tiles>
      <Drawer
        size="full"
        isOpen={show}
        onClose={onClose}
        placement="bottom"
        preserveScrollBarGap
        lockFocusAcrossFrames
        finalFocusRef={btnRef}
        variant={isSmallScreen ? 'none' : 'desktop'}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader alignSelf="center">Liked Songs</DrawerHeader>

          <DrawerBody alignSelf="center">
            {liked.map(({ track }, index) => {
              const isLast = index === liked.length - 1;
              return (
                <Card
                  ref={(node: HTMLDivElement | null) => {
                    isLast && setRef(node);
                  }}
                  key={track.id}
                  trackId={track.id}
                  uri={track.uri}
                  image={track.album.images[1].url}
                  albumUri={track.album.uri}
                  albumName={track.album.name}
                  name={track.name}
                  artist={track.album.artists[0].name}
                  artistUri={track.album.artists[0].uri}
                  explicit={track.explicit}
                  preview_url={track.preview_url}
                />
              );
            })}
          </DrawerBody>
          <Button variant="drawer" color="white" onClick={onClose}>
            close
          </Button>
        </DrawerContent>
      </Drawer>
    </Stack>
  );
};

export default LikedTracks;
