import { useFetcher, useSearchParams } from '@remix-run/react';
import { type ChangeEvent, useRef, useState, useEffect } from 'react';

import {
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  Input,
  Stack,
  InputRightElement,
  InputGroup,
  IconButton,
} from '@chakra-ui/react';

import { CloseSquare } from 'iconsax-react';

import useBlockScrollCheck from '~/hooks/useBlockScrollCheck';
import { useMobileDrawer, useMobileDrawerActions } from '~/hooks/useMobileDrawer';
import useSessionUser from '~/hooks/useSessionUser';
import { type Track } from '~/lib/types/types';

import Waver from '../icons/Waver';
import Tile from '../Tile';
import Tiles from '../tiles/Tiles';

const MobileDrawer = () => {
  const { isOpen } = useMobileDrawer();
  const { addFocus, onClose, removeFocus } = useMobileDrawerActions();
  const inputRef = useRef<HTMLInputElement>(null);
  const currentUser = useSessionUser();
  const id = currentUser?.userId;

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const { blockScrollOnMount } = useBlockScrollCheck();
  const { data, load, state } = useFetcher();
  const busy = state === 'loading' ?? false;

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value.trim()) {
      setSearch(e.currentTarget.value);
    } else {
      setSearch('');
      searchParams.delete('spotify');
      setSearchParams(searchParams, {
        replace: true,
        state: { scroll: false },
      });
    }
  };
  const onClearSearch = () => {
    setSearch('');
    searchParams.delete('spotify');
    setSearchParams(searchParams, {
      replace: true,
      state: { scroll: false },
    });
  };

  useEffect(() => {
    const delaySubmit = setTimeout(() => {
      if (search.trim().length > 0) {
        load(`/${id}/search?spotify=${search}`);
      }
    }, 1000);

    return () => clearTimeout(delaySubmit);
  }, [search, load, id]);

  useEffect(() => {
    if (data) {
      setTracks(
        data.results.tracks.items.map((track: SpotifyApi.TrackObjectFull) => ({
          albumName: track.album.name,
          albumUri: track.album.uri,
          artist: track.album.artists[0].name,
          artistUri: track.artists[0].uri,
          explicit: track.explicit,
          image: track.album.images[0].url,
          link: track.external_urls.spotify,
          name: track.name,
          preview_url: track.preview_url,
          trackId: track.id,
          uri: track.uri,
        })),
      );
    }
  }, [data]);

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        initialFocusRef={inputRef}
        size="full"
        autoFocus={false}
        blockScrollOnMount={blockScrollOnMount}
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
                  _placeholder={{ color: 'RGBA(255, 255, 255, 0.24)' }}
                />
                {search && (
                  <InputRightElement
                    h="35px"
                    w="65px"
                    pr={2}
                    justifyContent="end"
                    children={
                      <>
                        {busy && <Waver />}
                        <IconButton
                          aria-label="close"
                          variant="ghost"
                          size="xs"
                          borderRadius={8}
                          onClick={onClearSearch}
                          icon={<CloseSquare />}
                        />
                      </>
                    }
                  />
                )}
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
                      inDrawer
                      isQueuing
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
