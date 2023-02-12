import { Link, useFetcher, useParams } from '@remix-run/react';
import { forwardRef, useEffect, useState, useMemo, useRef } from 'react';

import { Box, Flex, Image, Stack, Text } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';

import { usePlaylistDrawerActions } from '~/hooks/usePlaylistDrawer';
import type { PlaylistTrack } from '~/lib/types/types';

import Tooltip from '../Tooltip';

export const decodeHtmlEntity = (str?: string) => {
  return str?.replace(/&#x([0-9A-Fa-f]+);/g, (_, dec) => {
    return String.fromCharCode(parseInt(dec, 16));
  });
};

type TileProps = PlaylistTrack & ChakraProps;

const PlaylistTile = forwardRef<HTMLDivElement, TileProps>(
  ({ description, image, isPublic, link, name, playlistId, trackTotal, uri, ...props }, ref) => {
    const [open, setOpen] = useState(false);
    const [tracks, setTracks] = useState<SpotifyApi.PlaylistObjectSimplified[]>();
    const [playlist, setPlaylist] = useState<PlaylistTrack>({
      description,
      image,
      isPublic,
      link,
      name,
      playlistId,
      trackTotal,
      tracks,
      uri,
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
      setPlaylist((p) => ({
        ...p,
        tracks,
      }));
    }, [tracks]);

    useEffect(() => {
      if (open && !initialFetch.current) {
        hasFetched.current = true;
        initialFetch.current = true;
        fetcher.load(`/${id}/playlistTracks?playlistId=${playlistId}`);
        setTracks(fetcher.data);
      }
    }, [open, fetcher, id, playlistId]);

    useEffect(() => {
      if (fetcher.data && !hasFetched.current) {
        onOpen(playlist);
        hasFetched.current = false;
      }
    }, [onOpen, playlist, fetcher.data, tracks]);

    return (
      <>
        <Stack ref={ref} flex="0 0 200px" {...props} cursor="pointer">
          <Link to={`/${id}/${playlist.playlistId}`}>
            <Flex direction="column">
              {/* {createdAt && (
              <HStack align="center" h="35px">
                {createdBy ? (
                  <Link to={`/${createdBy.userId}`}>
                    <HStack align="center">
                      <Image borderRadius={50} boxSize="25px" mb={1} src={createdBy.image} />
                      <Text fontWeight="semibold" fontSize="13px">
                        {createdBy.name.split(' ')[0]}
                      </Text>
                    </HStack>
                  </Link>
                ) : (
                  <Text fontWeight="semibold" fontSize="13px">
                    Anon
                  </Text>
                )}
                <Text as="span">·</Text>
                <Text fontSize="12px" opacity={0.6}>
                  {timeSince(createdAt ?? null)}
                </Text>
              </HStack>
            )} */}
              <Tooltip label={name} placement="top-start">
                <Image
                  boxSize="200px"
                  objectFit="cover"
                  src={image}
                  draggable={false}
                  onClick={onClick}
                />
              </Tooltip>
            </Flex>
            <Flex justify="space-between">
              <Stack spacing={0} onClick={onClick}>
                <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-word">
                  {name}
                </Text>
                {description ? (
                  <Flex align="center">
                    <Text fontSize="11px" opacity={0.8} noOfLines={2}>
                      {decodeHtmlEntity(description)}
                    </Text>
                  </Flex>
                ) : (
                  <Box h="13px" />
                )}
                <Text fontSize="11px">{trackTotal} songs</Text>
              </Stack>
            </Flex>
          </Link>
        </Stack>
      </>
    );
  },
);

PlaylistTile.displayName = 'Tile';

export default PlaylistTile;
