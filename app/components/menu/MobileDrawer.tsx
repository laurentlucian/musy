import {
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  Input,
  Stack,
  Spinner,
  InputRightElement,
  InputGroup,
} from '@chakra-ui/react';
import { type ChangeEvent, useRef, useState, useEffect } from 'react';
import { useMobileDrawer, useMobileDrawerActions } from '~/hooks/useMobileDrawer';
import useSessionUser from '~/hooks/useSessionUser';
import { type Track } from '~/lib/types/types';
import { useFetcher } from '@remix-run/react';
import Tiles from '../tiles/Tiles';
import Tile from '../Tile';

const MobileDrawer = () => {
  const { isOpen } = useMobileDrawer();
  const { onClose, addFocus, removeFocus } = useMobileDrawerActions();
  const inputRef = useRef<HTMLInputElement>(null);
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
          fetcher.load(`/${id}/search?spotify=${search}`);
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
          preview_url: track.preview_url,
          link: track.external_urls.spotify,
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
        initialFocusRef={inputRef}
        size="full"
        autoFocus={false}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody>
            <Stack pos="fixed" top={10} left={1} w="100vw">
              <InputGroup w="100%">
                <Input
                  ref={inputRef}
                  name="spotify"
                  variant="flushed"
                  size="sm"
                  value={search}
                  placeholder="search"
                  autoComplete="off"
                  borderRadius={0}
                  onChange={onChange}
                  fontSize="15px"
                  id="myInput"
                  onFocus={(e) => {
                    if (e.relatedTarget?.nodeName !== 'BUTTON') {
                      // onFocus is triggered by search btn when on desktop
                      // with this check, we avoid collision of set states
                      addFocus();
                    }
                  }}
                  onBlur={removeFocus}
                />
                <InputRightElement
                  h="35px"
                  w="65px"
                  pr={2}
                  justifyContent="end"
                  children={<>{busy && <Spinner size="xs" mr={2} />}</>}
                />
              </InputGroup>
              <Tiles>
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
                      preview_url={track.preview_url}
                      link={track.link}
                    />
                  ))}
              </Tiles>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
export default MobileDrawer;
