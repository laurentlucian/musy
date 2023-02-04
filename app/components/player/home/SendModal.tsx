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
} from '@chakra-ui/react';
import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useFetcher } from '@remix-run/react';
import type { Track } from '~/lib/types/types';
import Waver from '~/components/icons/Waver';
import { Refresh } from 'iconsax-react';
import Tiles from '~/components/tiles/Tiles';
import Tile from '~/components/Tile';
import { X } from 'react-feather';
import useIsMobile from '~/hooks/useIsMobile';

interface SendModalConfig {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  id: string;
  sendList: boolean | undefined;
  setSendList: Dispatch<SetStateAction<boolean | undefined>>;
}

const SendModal = ({
  isOpen,
  onClose,
  name,
  title,
  setTitle,
  id,
  sendList,
  setSendList,
}: SendModalConfig) => {
  const isSmallScreen = useIsMobile();
  const [search, setSearch] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [showTracks, setShowTracks] = useState(false);
  const [erect, setErect] = useState(false);
  const fetcher = useFetcher();
  const busy = fetcher.state === 'loading' ?? false;
  const inputRef = useRef<HTMLInputElement>(null);

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
  const onClearSearch = () => {
    setSearch('');
    setShowTracks(false);
  };

  const onCloseModal = () => {
    setSearch('');
    setShowTracks(false);
    onClose();
    setErect(false);
  };

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
  }, [sendList]);

  const Desktop = (
    <Modal
      isOpen={isOpen}
      onClose={onCloseModal}
      // isCentered
      motionPreset="scale"
      size="6xl"
      initialFocusRef={inputRef}
      blockScrollOnMount={!search}
    >
      <ModalOverlay />
      <ModalContent w={['300px', '800px']}>
        <ModalHeader>
          {title} to {name}
        </ModalHeader>
        <ModalCloseButton />
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
                    isQueuing={sendList}
                    isRecommending={!sendList}
                  />
                </Box>
              ))
            ) : erect && !search ? (
              <Box h="325px">
                {busy && (
                  <Box pos="relative" top="50%" left="980%">
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
                  <Box pos="relative" top="50%" left="980%">
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
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} initialFocusRef={inputRef}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          {title} to {name}
        </DrawerHeader>

        <DrawerBody>
          <Input placeholder="Type here..." />
        </DrawerBody>

        <DrawerFooter></DrawerFooter>
      </DrawerContent>
    </Drawer>
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
