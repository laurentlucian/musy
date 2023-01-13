import {
  Button,
  useDisclosure,
  Icon,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  Stack,
} from '@chakra-ui/react';
import { HeartAdd, ArrowDown2, ArrowRight2 } from 'iconsax-react';
import { useRef, useState, useEffect } from 'react';
import { useTypedFetcher } from 'remix-typedjson';
// import useIsMobile from '~/hooks/useIsMobile';
import useIsVisible from '~/hooks/useIsVisible';
import type { loader } from '~/routes/$id/playlists';
import PlaylistCard from '../tiles/PlaylistCard';

const SaveTo = ({ currentUserId }: { currentUserId: string | undefined }) => {
  const fetcher = useTypedFetcher<typeof loader>();;
  const offsetRef = useRef(0);
  const [setRef, isVisible] = useIsVisible();
  const initialFetch = useRef(false);
  const hasFetched = useRef(false);
  const [playlists, setPlaylists] = useState<SpotifyApi.PlaylistObjectSimplified[]>([]);
  const selectMenu = useDisclosure();
  const playlistMenu = useDisclosure();

  useEffect(() => {
    if (playlistMenu.isOpen && !initialFetch.current) {
      fetcher.load(`/${currentUserId}/playlists?offset=${0}`);
      setPlaylists(fetcher.data);
      initialFetch.current = true;
    }
  }, [playlistMenu.isOpen, fetcher, currentUserId]);

  useEffect(() => {
    if (isVisible && !hasFetched.current) {
      const newOffset = offsetRef.current + 50;
      offsetRef.current = newOffset;
      fetcher.load(`/${currentUserId}/playlists?offset=${newOffset}`);
      hasFetched.current = true;
    }
  }, [isVisible, fetcher, currentUserId]);

  useEffect(() => {
    if (fetcher.data) {
      setPlaylists((prev) => [...prev, ...fetcher.data]);
      hasFetched.current = false;
    }
  }, [fetcher.data]);

  // const isSmallScreen = useIsMobile();

  // const { onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  const SaveSongTo = () => (
    <Button
      leftIcon={<HeartAdd />}
      onClick={selectMenu.onToggle}
      pos="relative"
      variant="ghost"
      mx="25px"
      w={['100vw', '550px']}
      justifyContent="left"
    >
      Save Song to
      <Icon
        as={selectMenu.isOpen ? ArrowDown2 : ArrowRight2}
        boxSize="25px"
        ml={['auto !important', '40px !important']}
      />
    </Button>
  );

  return (
    <>
      <SaveSongTo />
      <Drawer
        isOpen={selectMenu.isOpen}
        placement="right"
        onClose={selectMenu.onClose}
        finalFocusRef={btnRef}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody overflowX="hidden">
            <Stack pos="fixed" top={0}>
              <header>Save To:</header>
            </Stack>
            <Stack>
              {/* <Input placeholder="find playlist" /> */}
              <Button
                pos="relative"
                variant="ghost"
                mx="25px"
                w={['100vw', '550px']}
                justifyContent="left"
              >
                Save to Liked Songs
              </Button>
              <Button
                pos="relative"
                variant="ghost"
                mx="25px"
                w={['100vw', '550px']}
                justifyContent="left"
                onClick={playlistMenu.onOpen}
              >
                Save to Playlist
              </Button>
              <Button
                pos="relative"
                variant="ghost"
                mx="25px"
                w={['100vw', '550px']}
                justifyContent="left"
              >
                Create New Playlist
              </Button>
            </Stack>
            <Stack pos="fixed" bottom={0}>
              <Button variant="drawer" onClick={selectMenu.onClose} h="40px" pt="10px" w="100vw">
                cancel
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Drawer
        isOpen={playlistMenu.isOpen}
        placement="right"
        onClose={playlistMenu.onClose}
        finalFocusRef={btnRef}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody overflowX="hidden">
            {playlists.map((list, index) => {
              const isLast = index === playlists.length - 1;
              return (
                <PlaylistCard
                  ref={(node) => {
                    isLast && setRef(node);
                  }}
                  key={list.id}
                  uri={list.uri}
                  image={list.images[0]?.url}
                  playlistUri={list.uri}
                  name={list.name}
                  description={list.description}
                />
              );
            })}
            <Stack pos="fixed" bottom={0}>
              <Button variant="drawer" onClick={playlistMenu.onClose} h="40px" pt="10px" w="100vw">
                cancel
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SaveTo;
