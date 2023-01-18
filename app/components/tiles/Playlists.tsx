import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Stack,
} from '@chakra-ui/react';
import { useFetcher, useParams } from '@remix-run/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import useIsVisible from '~/hooks/useIsVisible';
import useIsMobile from '~/hooks/useIsMobile';
import PlaylistCard from './PlaylistCard';
import PlaylistTile from '../PlaylistTile';
import Tiles from './Tiles';
import useDrawerBackButton from '~/hooks/useDrawerBackButton';

const Playlists = ({
  playlists: initialPlaylists,
}: {
  playlists: SpotifyApi.PlaylistObjectSimplified[];
}) => {
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [show, setShow] = useState(false);
  const { id } = useParams();

  const fetcher = useFetcher();
  const offsetRef = useRef(0);
  const [setRef, isVisible] = useIsVisible();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (isVisible && !hasFetched.current) {
      const newOffset = offsetRef.current + 50;
      offsetRef.current = newOffset;
      fetcher.load(`/${id}/playlists?offset=${newOffset}`);
      hasFetched.current = true;
    }
  }, [isVisible, fetcher, id]);

  useEffect(() => {
    if (fetcher.data) {
      setPlaylists((prev) => [...prev, ...fetcher.data]);
      hasFetched.current = false;
    }
  }, [fetcher.data]);

  useEffect(() => {
    setPlaylists(initialPlaylists);
  }, [initialPlaylists]);

  const isSmallScreen = useIsMobile();
  const btnRef = useRef<HTMLButtonElement>(null);

  const onClose = useCallback(() => {
    setShow(false);
  }, [setShow]);

  useDrawerBackButton(onClose, show);

  if (!playlists) return null;
  const scrollButtons = playlists.length > 5;
  return (
    <Stack spacing={3}>
      <Tiles title="Playlists" scrollButtons={scrollButtons} setShow={setShow}>
        {playlists.map((list, index) => {
          const isLast = index === playlists.length - 1;

          return (
            <PlaylistTile
              ref={(node) => {
                isLast && setRef(node);
              }}
              trackId=""
              playlist
              key={list.id}
              uri={list.uri}
              image={list.images[0]?.url}
              name={list.name}
              description={list.description}
              explicit={false}
            />
          );
        })}
      </Tiles>
      {scrollButtons && (
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
            <DrawerHeader alignSelf="center">Playlists</DrawerHeader>

            <DrawerBody alignSelf="center">
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
            </DrawerBody>
            <Button variant="drawer" color="white" onClick={() => setShow(false)}>
              close
            </Button>
          </DrawerContent>
        </Drawer>
      )}
    </Stack>
  );
};

export default Playlists;
