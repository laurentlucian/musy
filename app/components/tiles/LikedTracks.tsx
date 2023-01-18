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
    setShow(true);
  }, [setShow]);

  useEffect(() => {
    if (show) {
      // Add a fake history event so that the back button does nothing if pressed once
      window.history.pushState('drawer', document.title, window.location.href);

      addEventListener('popstate', onClose);

      // Here is the cleanup when this component unmounts
      return () => {
        removeEventListener('popstate', onClose);
        // If we left without using the back button, aka by using a button on the page, we need to clear out that fake history event
        if (window.history.state === 'drawer') {
          window.history.back();
        }
      };
    }
  }, [show, onClose]);

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
