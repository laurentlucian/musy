import { useFetcher, useSearchParams } from '@remix-run/react';
import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { X } from 'react-feather';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  InputGroup,
  Input,
  InputRightElement,
  IconButton,
  Box,
  Stack,
} from '@chakra-ui/react';

import { Refresh } from 'iconsax-react';
import { useTypedFetcher } from 'remix-typedjson';

import Waver from '~/components/icons/Waver';
import Tile from '~/components/Tile';
import Tiles from '~/components/tiles/Tiles';
import { useDrawerTrack } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import type { Track } from '~/lib/types/types';
import type { action } from '~/routes/$id/add';
import type { action as actionB } from '~/routes/$id/recommend';

interface SendModalConfig {
  currentUserId: string | undefined;
  id: string;
  isOpen: boolean;
  name: string;
  onClose: () => void;
  sendList: boolean | undefined;
  setSendList: Dispatch<SetStateAction<boolean | undefined>>;
  setTitle: Dispatch<SetStateAction<string>>;
  title: string;
}

const SendModal = ({
  currentUserId,
  id,
  isOpen,
  name,
  onClose,
  sendList,
  setSendList,
  setTitle,
  title,
}: SendModalConfig) => {
  const isSmallScreen = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [showTracks, setShowTracks] = useState(false);
  const [erect, setErect] = useState(false);
  const [blockScrollOnMount, setBlockScrollOnMount] = useState(false);
  const fetcher = useFetcher();
  const fetcherA = useTypedFetcher<typeof action>();
  const fetcherB = useTypedFetcher<typeof actionB>();
  const [fetchers, setFetchers] = useState(sendList ? fetcherA : fetcherB);
  const busy = fetcher.state === 'loading' ?? false;
  const onInputMount = (input: HTMLInputElement | null) => {
    if (input && isOpen) {
      input.focus();
    }
  };
  const inputRef = useRef<HTMLInputElement>(null);
  const track = useDrawerTrack();
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value.trim()) {
      setSearch(e.currentTarget.value);
    } else {
      setSearch('');
      setShowTracks(false);
      searchParams.delete('spotify');
      setSearchParams(searchParams, {
        replace: true,
        state: { scroll: false },
      });
    }
  };
  const onClearSearch = () => {
    setSearch('');
    setShowTracks(false);
    searchParams.delete('spotify');
    setSearchParams(searchParams, {
      replace: true,
      state: { scroll: false },
    });
  };

  const onCloseModal = () => {
    setSearch('');
    setShowTracks(false);
    onClose();
    setErect(false);
    searchParams.delete('spotify');
    setSearchParams(searchParams, {
      replace: true,
      state: { scroll: false },
    });
  };

  useEffect(() => {
    const delaySubmit = setTimeout(() => {
      if (search.trim().length > 0) {
        fetcher.load(`/${id}/search?spotify=${search}`);
      }
    }, 1000);

    return () => clearTimeout(delaySubmit);
  }, [search, fetcher.load]);

  useEffect(() => {
    if (fetcher.data) {
      setShowTracks(true);
      setErect(true);
      setTracks(
        fetcher.data.results.tracks.items.map((track: SpotifyApi.TrackObjectFull) => ({
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
  }, [fetcher.data]);

  useEffect(() => {
    sendList ? setTitle('queue') : setTitle('recommend');
    sendList ? setFetchers(fetcherA) : setFetchers(fetcherB);
  }, [sendList]);

  useEffect(() => {
    track ? setBlockScrollOnMount(false) : setBlockScrollOnMount(true);
  }, [track]);

  const ModalControls = (
    <Box
      pos="fixed"
      top={3}
      right={isOpen ? 3 : '-50px'}
      zIndex={9999}
      display={isOpen ? 'block' : 'none'}
    >
      <IconButton
        variant="ghost"
        aria-label={`switch to ${sendList ? 'queue' : 'recommend'}`}
        icon={<Refresh size="15px" />}
        onClick={(e) => {
          e.preventDefault();
          setSendList(!sendList);
        }}
      />
      <IconButton
        variant="ghost"
        aria-label="close"
        icon={<X />}
        onClick={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
    </Box>
  );

  const Desktop = (
    <Modal
      isOpen={isOpen}
      onClose={onCloseModal}
      motionPreset="scale"
      size="6xl"
      blockScrollOnMount={blockScrollOnMount}
    >
      <ModalOverlay />
      <ModalContent w={['300px', '800px']}>
        <ModalHeader>
          {title} to {name}
        </ModalHeader>
        <ModalCloseButton autoFocus={false} />
        <IconButton
          variant="ghost"
          aria-label={`switch to ${sendList ? 'queue' : 'recommend'}`}
          icon={<Refresh size="15px" />}
          onClick={() => {
            setSendList(!sendList);
          }}
          pos="absolute"
          right="40px"
          top="8px"
        />
        <ModalBody>
          <InputGroup justifySelf="center" w="725px" ml="26px" mb="33px">
            <Input
              ref={onInputMount}
              name="spotify"
              variant="flushed"
              value={search}
              placeholder="search"
              autoComplete="off"
              borderRadius={0}
              onChange={onChange}
              fontSize="15px"
              id="myInput"
              autoFocus
            />
            {search && (
              <InputRightElement
                h="35px"
                w="65px"
                pr={2}
                justifyContent="end"
                children={
                  <IconButton
                    aria-label="close"
                    variant="ghost"
                    borderRadius={8}
                    onClick={onClearSearch}
                    icon={<X />}
                  />
                }
              />
            )}
          </InputGroup>
          <Tiles>
            {showTracks ? (
              tracks.map((track) => (
                <Box minH="325px">
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
                    fetcher={fetchers}
                    isQueuing={sendList}
                    isRecommending={!sendList}
                    id={id}
                    currentUserId={currentUserId}
                  />
                </Box>
              ))
            ) : erect && !search ? (
              <Box h="325px">
                {busy && (
                  <Box pos="relative" top="30%" left="980%">
                    <Waver />
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                h={search ? '325px' : 0}
                transition="height 0.8s ease-in-out"
                transitionDelay="0.4s"
              >
                {busy && (
                  <Box pos="relative" top="30%" left="980%">
                    <Waver />
                  </Box>
                )}
              </Box>
            )}
          </Tiles>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
  const Mobile = (
    <>
      {ModalControls}
      <Drawer
        isOpen={isOpen}
        placement="left"
        size="full"
        onClose={onClose}
        autoFocus={false}
        blockScrollOnMount={blockScrollOnMount}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            {title} to {name}
          </DrawerHeader>
          <DrawerBody>
            <InputGroup justifySelf="center" w="85vw" ml="26px" mb="33px">
              <Input
                ref={inputRef}
                name="spotify"
                variant="flushed"
                value={search}
                placeholder="search"
                autoComplete="off"
                borderRadius={0}
                onChange={onChange}
                fontSize="15px"
                id="myInput"
                _placeholder={{ color: 'RGBA(255, 255, 255, 0.24)' }}
                autoFocus
              />
              {search && (
                <InputRightElement
                  h="35px"
                  w="65px"
                  pr={2}
                  justifyContent="end"
                  children={
                    <IconButton
                      aria-label="close"
                      variant="ghost"
                      borderRadius={8}
                      onClick={onClearSearch}
                      icon={<X />}
                    />
                  }
                />
              )}
            </InputGroup>
            <Tiles>
              {showTracks &&
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
                    fetcher={fetchers}
                    inDrawer
                    isQueuing={sendList}
                    isRecommending={!sendList}
                    id={id}
                    currentUserId={currentUserId}
                  />
                ))}
            </Tiles>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );

  return isSmallScreen ? Mobile : Desktop;
};

export default SendModal;

/*
body has a search
your recent queued songs
your recent likes
your recent listened
maybe a what does {name} like? button <- maybe in footer
*/
