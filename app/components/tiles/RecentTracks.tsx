import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Stack,
} from '@chakra-ui/react';
import useDrawerBackButton from '~/hooks/useDrawerBackButton';
import { useState, useRef, useCallback } from 'react';
import useIsMobile from '~/hooks/useIsMobile';
import Tiles from './Tiles';
import Tile from '../Tile';
import Card from '../Card';

const RecentTracks = ({ recent }: { recent: SpotifyApi.PlayHistoryObject[] }) => {
  const [show, setShow] = useState(false);
  const scrollButtons = recent.length > 5;
  const isSmallScreen = useIsMobile();
  const btnRef = useRef<HTMLButtonElement>(null);

  const onClose = useCallback(() => {
    setShow(false);
  }, [setShow]);

  useDrawerBackButton(onClose, show);

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
              link={track.external_urls.spotify}
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
                  link={track.external_urls.spotify}
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
