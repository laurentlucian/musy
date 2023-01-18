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
import { useState, useRef, useEffect, useCallback } from 'react';
import Tiles from './Tiles';
import Tile from '../Tile';
import Card from '../Card';
import useIsMobile from '~/hooks/useIsMobile';

const RecentTracks = ({ recent }: { recent: SpotifyApi.PlayHistoryObject[] }) => {
  const [show, setShow] = useState(false);
  const scrollButtons = recent.length > 5;
  const isSmallScreen = useIsMobile();
  const btnRef = useRef<HTMLButtonElement>(null);

  const onClose = useCallback(() => {
    setShow(false);
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

  return (
    <Stack spacing={3}>
      <Tiles title="Recently played" scrollButtons={scrollButtons} setShow={setShow}>
        {recent.map(({ track, played_at }) => {
          return (
            <Tile
              key={played_at}
              uri={track.uri}
              trackId={track.id}
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
          <DrawerHeader alignSelf="center">Recently played</DrawerHeader>

          <DrawerBody alignSelf="center">
            {recent.map(({ track, played_at }) => {
              return (
                <Card
                  key={played_at}
                  uri={track.uri}
                  trackId={track.id}
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

export default RecentTracks;
