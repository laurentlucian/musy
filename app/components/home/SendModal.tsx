import { useFetcher, useSearchParams } from '@remix-run/react';
import { useState, useEffect, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
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
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  InputGroup,
  Input,
  InputRightElement,
  IconButton,
  Box,
  DrawerCloseButton,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';

import { Refresh } from 'iconsax-react';

import SendButton from '~/components/fullscreen/shared/SendButton';
import Tile from '~/components/tiles/tile/Tile';
import TileInfoAction from '~/components/tiles/tile/TileInfoAction';
import Tiles from '~/components/tiles/Tiles';
import useIsMobile from '~/hooks/useIsMobile';
import Waver from '~/lib/icons/Waver';
import type { Track } from '~/lib/types/types';

interface SendModalConfig {
  isOpen: boolean;
  name: string;
  onClose: () => void;
  profileId: string;
  sendList: boolean | undefined;
  setSendList: Dispatch<SetStateAction<boolean | undefined>>;
}

const SendModal = ({ isOpen, onClose, profileId, sendList, setSendList }: SendModalConfig) => {
  const isSmallScreen = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [showTracks, setShowTracks] = useState(false);
  const [erect, setErect] = useState(false);
  const { data, load, state } = useFetcher();

  const busy = state === 'loading' ?? false;

  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('musy.200', 'musy.900');

  const onInputMount = (input: HTMLInputElement | null) => {
    if (input && isOpen) {
      input.focus();
    }
  };

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
        load(`/${profileId}/search?spotify=${search}`);
      }
    }, 1000);

    return () => clearTimeout(delaySubmit);
  }, [search, load, profileId]);

  useEffect(() => {
    if (data) {
      setShowTracks(true);
      setErect(true);
      setTracks(
        data.results.tracks.items.map((track: SpotifyApi.TrackObjectFull) => ({
          albumName: track.album.name,
          albumUri: track.album.uri,
          artist: track.album.artists[0].name,
          artistUri: track.artists[0].uri,
          duration: track.duration_ms,
          explicit: track.explicit,
          id: track.id,
          image: track.album.images[0].url,
          link: track.external_urls.spotify,
          name: track.name,
          preview_url: track.preview_url,
          uri: track.uri,
        })),
      );
    }
  }, [data]);

  const CycleButton = (
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
      mt="8px"
      color={['unset', color]}
    />
  );

  const SearchLine = (
    <InputGroup justifySelf="center" w={['88vw', '94%']} ml="26px" mb="33px">
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
        tabIndex={1}
        _placeholder={isSmallScreen ? undefined : { color: '#41404080' }}
      />
      {search && (
        <InputRightElement
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
  );

  const Desktop = (
    <Modal isOpen={isOpen} onClose={onCloseModal} motionPreset="scale" size="6xl">
      <ModalOverlay />
      <ModalContent w={['300px', '800px']} bg={bg} color={color}>
        <ModalHeader>
          <Text>queue</Text>
          <ModalCloseButton mt="8px" />
          {CycleButton}
        </ModalHeader>
        <ModalBody>
          {SearchLine}
          <Tiles>
            {showTracks ? (
              tracks.map((track, index) => (
                <Box minH="325px" key={track.id}>
                  <Tile
                    track={track}
                    tracks={tracks}
                    index={index}
                    layoutKey="SendModal"
                    action={<SendButton userId={profileId} trackId={track.id} />}
                    info={<TileInfoAction action />}
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
      <Drawer isOpen={isOpen} placement="left" size="full" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <Text>Queue</Text>
            <DrawerCloseButton mt="8px" />
            {CycleButton}
          </DrawerHeader>
          <DrawerBody>
            {SearchLine}
            <Tiles>
              {showTracks &&
                tracks.map((track, index) => (
                  <Tile
                    key={track.id}
                    track={track}
                    tracks={tracks}
                    index={index}
                    layoutKey="SendModal"
                    action={<SendButton userId={profileId} trackId={track.id} />}
                    info={<TileInfoAction action />}
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
