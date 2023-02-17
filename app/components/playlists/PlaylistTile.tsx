import { Link, useFetcher, useParams } from '@remix-run/react';
import { forwardRef, useEffect, useState, useRef } from 'react';

import { Box, Flex, Image, Stack, Text } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';

import { usePlaylistDrawerActions } from '~/hooks/usePlaylistDrawer';

import Tooltip from '../Tooltip';

export const decodeHtmlEntity = (str?: string) => {
  return str?.replace(/&#x([0-9A-Fa-f]+);/g, (_, dec) => {
    return String.fromCharCode(parseInt(dec, 16));
  });
};

type TileProps = { playlist: SpotifyApi.PlaylistObjectSimplified } & ChakraProps;

const PlaylistTile = forwardRef<HTMLDivElement, TileProps>(({ playlist, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  const [trackz, setTrackz] = useState<SpotifyApi.PlaylistObjectSimplified[]>([]);
  const [list, setList] = useState<
    SpotifyApi.PlaylistObjectSimplified & { trackz: SpotifyApi.PlaylistObjectSimplified[] }
  >({
    ...playlist,
    trackz: [],
  });

  const initialFetch = useRef(false);
  const hasFetched = useRef(false);

  const fetcher = useFetcher();
  const { id } = useParams();
  const { onOpen } = usePlaylistDrawerActions();

  const onClick = () => {
    setOpen(true);
  };

  useEffect(() => {
    setList((p) => ({
      ...p,
      trackz,
    }));
  }, [trackz]);

  useEffect(() => {
    if (open && !initialFetch.current) {
      hasFetched.current = true;
      initialFetch.current = true;
      fetcher.load(`/${id}/playlistTracks?playlistId=${list.id}`);
      setTrackz(fetcher.data);
    }
  }, [open, fetcher, id, list.id]);

  useEffect(() => {
    if (fetcher.data && !hasFetched.current) {
      onOpen(list);
      hasFetched.current = false;
    }
  }, [onOpen, list, fetcher.data]);

  return (
    <>
      <Stack ref={ref} flex="0 0 200px" {...props} cursor="pointer">
        <Link to={`/${id}/${list.id}`}>
          <Flex direction="column">
            <Tooltip label={list.name} placement="top-start">
              <Image
                boxSize="200px"
                objectFit="cover"
                src={list.images[0].url}
                draggable={false}
                onClick={onClick}
              />
            </Tooltip>
          </Flex>
          <Flex justify="space-between">
            <Stack spacing={0} onClick={onClick}>
              <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-word">
                {list.name}
              </Text>
              {list.description ? (
                <Flex align="center">
                  <Text fontSize="11px" opacity={0.8} noOfLines={2}>
                    {decodeHtmlEntity(list.description)}
                  </Text>
                </Flex>
              ) : (
                <Box h="13px" />
              )}
              <Text fontSize="11px">{list.tracks.total} songs</Text>
            </Stack>
          </Flex>
        </Link>
      </Stack>
    </>
  );
});

PlaylistTile.displayName = 'Tile';

export default PlaylistTile;
