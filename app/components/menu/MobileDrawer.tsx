import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Button,
  Input,
  Stack,
  Spinner,
  InputRightElement,
  InputGroup,
} from '@chakra-ui/react';
import { useFetcher, useTransition } from '@remix-run/react';
import { type ChangeEvent, useRef, useState, useEffect } from 'react';
import useMobileDrawerStore from '~/hooks/useMobileDrawer';
import useSessionUser from '~/hooks/useSessionUser';
import { type Track } from '~/lib/types/types';
import Tiles from '../Tiles';
import Tile from '../Tile';

const MobileDrawer = () => {
  const { isOpen, onClose } = useMobileDrawerStore();
  const btnRef = useRef<HTMLButtonElement>(null);
  const currentUser = useSessionUser();
  const id = currentUser?.userId;

  const [search, setSearch] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const fetcher = useFetcher();
  const busy = fetcher.state === 'loading' ?? false;

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value.trim()) {
      setSearch(e.currentTarget.value);
      setTimeout(() => {
        if (search.trim().length > 0) {
          fetcher.load(`/globalSearch?spotify=${search}&id=${id}`);
        }
      }, 1000);
    } else {
      setSearch('');
    }
  };

  useEffect(() => {
    if (fetcher.data) {
      setTracks(
        fetcher.data.results.tracks.items.map((track: SpotifyApi.TrackObjectFull) => ({
          uri: track.uri,
          trackId: track.id,
          image: track.album.images[0].url,
          albumUri: track.album.uri,
          albumName: track.album.name,
          name: track.name,
          artist: track.album.artists[0].name,
          artistUri: track.artists[0].uri,
          explicit: track.explicit,
        })),
      );
    }
  }, [fetcher.data]);

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader></DrawerHeader>

          <DrawerBody>
            <Stack pos="fixed" top={1} left={1} w="100vw">
              <InputGroup w="88%">
                <Input
                  name="spotify"
                  variant="flushed"
                  size="sm"
                  value={search}
                  placeholder="search"
                  autoComplete="off"
                  borderRadius={0}
                  onChange={onChange}
                  fontSize="15px"
                />
                <InputRightElement
                  h="35px"
                  w="65px"
                  pr={2}
                  justifyContent="end"
                  children={<>{busy && <Spinner size="xs" mr={2} />}</>}
                />
              </InputGroup>
              <Button
                variant="close"
                onClick={() => {
                  setSearch('');
                  setTracks([]);
                }}
              >
                x
              </Button>
              <Tiles title="">
                {search &&
                  tracks.map((track) => (
                    <Tile
                      key={track.trackId}
                      trackId={track.trackId}
                      uri={track.uri}
                      image={track.image}
                      albumUri={track.albumUri}
                      albumName={track.albumName}
                      name={track.name}
                      artist={track.artist}
                      artistUri={track.artistUri}
                      explicit={track.explicit}
                    />
                  ))}
              </Tiles>
            </Stack>
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
export default MobileDrawer;
