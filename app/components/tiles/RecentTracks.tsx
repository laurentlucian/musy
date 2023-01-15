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
import { useState, useRef } from 'react';
import Tiles from './Tiles';
import Tile from '../Tile';
import Card from '../Card';
import useIsMobile from '~/hooks/useIsMobile';

const RecentTracks = ({ recent }: { recent: SpotifyApi.PlayHistoryObject[] }) => {
  const [show, setShow] = useState(false);
  const scrollButtons = recent.length > 5;
  const isSmallScreen = useIsMobile();
  const { onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

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
          <Button variant="drawer" color="white" onClick={() => setShow(false)}>
            close
          </Button>
        </DrawerContent>
      </Drawer>
    </Stack>
  );
};

export default RecentTracks;
