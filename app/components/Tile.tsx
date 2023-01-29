import { Flex, HStack, IconButton, Image, Stack, Text } from '@chakra-ui/react';
import explicitImage from '~/assets/explicit-solid.svg';
import type { ChakraProps } from '@chakra-ui/react';
import { useClickDrag } from '~/hooks/useDrawer';
import type { Track } from '~/lib/types/types';
import type { Profile, Settings } from '@prisma/client';
import SpotifyLogo from './icons/SpotifyLogo';
import { timeSince } from '~/lib/utils';
import { Link, type SubmitFunction, useLocation } from '@remix-run/react';
import { Send2 } from 'iconsax-react';
import { forwardRef } from 'react';
import Tooltip from './Tooltip';
import type { TypedFetcherWithComponents, TypedJsonResponse } from 'remix-typedjson';
import type { DataFunctionArgs } from '@remix-run/server-runtime';

type TileProps = {
  uri: string;
  trackId: string;
  image: string;
  albumUri: string | null;
  albumName: string | null;
  name: string;
  artist: string | null;
  artistUri: string | null;
  explicit: boolean;
  preview_url: string | null;
  link: string;
  currentUser?:
    | (Profile & {
        settings: Settings | null;
        liked: {
          trackId: string;
        }[];
      })
    | null;
  submit?: SubmitFunction;
  id?: string;
  fetcher?: TypedFetcherWithComponents<
    ({ request, params }: DataFunctionArgs) => Promise<TypedJsonResponse<string>>
  >;

  // will show header (profile above tile) if createdAt is defined
  createdBy?: Profile | null;
  createdAt?: Date;
  playlist?: Boolean;
} & ChakraProps;

const Tile = forwardRef<HTMLDivElement, TileProps>(
  (
    {
      uri,
      trackId,
      image,
      albumUri,
      albumName,
      name,
      artist,
      artistUri,
      explicit,
      preview_url,
      link,
      createdAt,
      createdBy,
      playlist,
      currentUser,
      submit,
      id,
      fetcher,
      ...props
    },
    ref,
  ) => {
    const { pathname, search } = useLocation();
    const isSearching = pathname.includes('/search');
    const decodeHtmlEntity = (str?: string) => {
      return str?.replace(/&#x([0-9A-Fa-f]+);/g, (_, dec) => {
        return String.fromCharCode(parseInt(dec, 16));
      });
    };
    const { onMouseDown, onMouseMove, onClick } = useClickDrag();
    const track: Track = {
      uri: uri,
      trackId,
      image,
      albumUri,
      albumName,
      name,
      artist,
      artistUri,
      explicit,
      preview_url,
      link,
    };
    const addToQueue = () => {
      if (!currentUser && submit) {
        // @todo figure out a better way to require authentication on click;
        // after authentication redirect, add to queue isn't successful. user needs to click again
        return submit(null, {
          replace: true,
          method: 'post',
          action: '/auth/spotify?returnTo=' + pathname + search,
        });
      }

      const action = `/${id}/add`;

      const fromUserId = currentUser?.userId;
      const sendToUserId = id;

      const data = {
        trackId: trackId ?? '',

        fromId: fromUserId ?? '',
        toId: sendToUserId ?? '',
        action: 'add',
      };

      if (fetcher) {
        fetcher.submit(data, { replace: true, method: 'post', action });
      }
    };

    return (
      <>
        <Stack ref={ref} flex="0 0 200px" {...props} cursor="pointer">
          <Flex direction="column">
            {createdAt && (
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
            )}
            <Tooltip label={albumName} placement="top-start">
              <Image
                boxSize="200px"
                minW="200px"
                objectFit="cover"
                src={image}
                draggable={false}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onClick={() => onClick(track)}
              />
            </Tooltip>
          </Flex>
          <Flex justify="space-between">
            <Stack
              spacing={0}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onClick={() => onClick(track)}
            >
              <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-word">
                {name}
              </Text>
              {artist && (
                <Flex align="center">
                  {artistUri ? (
                    <Stack>
                      <Stack direction="row">
                        {explicit && <Image src={explicitImage} w="19px" mr="-3px" />}
                        <Text fontSize="11px" opacity={0.8} noOfLines={2}>
                          {artist}
                        </Text>
                      </Stack>
                      {isSearching ? <SpotifyLogo w="70px" h="21px" /> : null}
                    </Stack>
                  ) : (
                    <Text fontSize="11px" opacity={0.8} noOfLines={2}>
                      {decodeHtmlEntity(artist)}
                    </Text>
                  )}
                </Flex>
              )}
            </Stack>
            <Stack>
              {!isSearching ? <SpotifyLogo icon px="5px" /> : null}
              {isSearching ? (
                <IconButton
                  onClick={addToQueue}
                  pos="relative"
                  variant="ghost"
                  color="music.200"
                  icon={<Send2 />}
                  _hover={{ color: 'white' }}
                  aria-label={`add to ${'hi'}'s queue`}
                />
              ) : null}
            </Stack>
          </Flex>
        </Stack>
      </>
    );
  },
);

Tile.displayName = 'Tile';

export default Tile;
