import { Link, type SubmitFunction, useLocation } from '@remix-run/react';
import type { DataFunctionArgs } from '@remix-run/server-runtime';
import { forwardRef, useRef } from 'react';
import { Check, AlertCircle } from 'react-feather';

import { Flex, HStack, IconButton, Image, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';
import { motion } from 'framer-motion';
import { Send2 } from 'iconsax-react';
import type { TypedFetcherWithComponents, TypedJsonResponse } from 'remix-typedjson';

import explicitImage from '~/assets/explicit-solid.svg';
import { useClickDrag } from '~/hooks/useDrawer';
import type { Track, User } from '~/lib/types/types';
import { timeSince } from '~/lib/utils';

import SpotifyLogo from './icons/SpotifyLogo';
import Waver from './icons/Waver';
import Tooltip from './Tooltip';

type TileProps = {
  createdAt?: Date;
  // will show header (profile above tile) if createdAt is defined
  createdBy?: Profile | null;
  currentUser?: User | null;
  currentUserId?: string | undefined;
  fetcher?: TypedFetcherWithComponents<
    ({ params, request }: DataFunctionArgs) => Promise<TypedJsonResponse<string>>
  >;
  fetcherRec?: TypedFetcherWithComponents<
    ({ params, request }: DataFunctionArgs) => Promise<TypedJsonResponse<string>>
  >;
  inDrawer?: boolean;
  index?: number;
  isQueuing?: boolean;
  isRecommending?: boolean;
  layoutKey: string;
  list?: boolean;
  playlist?: Boolean;

  profileId: string;
  submit?: SubmitFunction;
  track: Track;
  tracks: Track[];
  w?: string[];
} & ChakraProps;

const Tile = forwardRef<HTMLDivElement, TileProps>(
  (
    {
      createdAt,
      createdBy,
      currentUser,
      currentUserId,
      fetcher,
      fetcherRec,
      inDrawer,
      index,
      isQueuing,
      isRecommending,
      layoutKey,
      list,
      profileId,
      submit,
      track,
      tracks,
      w,
      ...props
    },
    ref,
  ) => {
    const { pathname, search } = useLocation();
    const decodeHtmlEntity = (str?: string) => {
      return str?.replace(/&#x([0-9A-Fa-f]+);/g, (_, dec) => {
        return String.fromCharCode(parseInt(dec, 16));
      });
    };
    const { onClick, onMouseDown, onMouseMove } = useClickDrag();
    const color = useColorModeValue(`${inDrawer ? 'music.200' : 'music.800'}`, 'music.200');
    const clickedRef = useRef<string>();
    const handleSendButton = () => {
      if (!currentUser && submit) {
        // @todo figure out a better way to require authentication on click;
        // after authentication redirect, add to queue isn't successful. user needs to click again
        return submit(null, {
          action: '/auth/spotify?returnTo=' + pathname + search,
          method: 'post',
          replace: true,
        });
      }

      clickedRef.current = track.id;
      const action = isRecommending ? `/${profileId}/recommend` : `/${profileId}/add`;

      const fromUserId = currentUser?.userId || currentUserId;
      const sendToUserId = profileId;

      const queueData = {
        action: 'send',

        fromId: fromUserId ?? '',
        toId: sendToUserId,
        trackId: track.id,
      };

      const recommendData = {
        action: 'recommend',
        albumName: track.albumName,
        albumUri: track.albumUri,
        artist: track.artist,
        artistUri: track.artistUri,
        comment: '',
        explicit: track.explicit ? 'true' : '',
        fromId: fromUserId ?? '',
        image: track.image,
        link: track.link,
        name: track.name,
        preview_url: track.preview_url ?? '',

        toId: sendToUserId,
        trackId: track.id,
        uri: track.uri,
      };
      if (fetcher && isQueuing) {
        fetcher.submit(queueData, { action, method: 'post', replace: true });
      }
      if (fetcher && isRecommending) {
        fetcher.submit(recommendData, { action, method: 'post', replace: true });
      }
    };

    const isClicked = clickedRef.current === track.id;
    let isAdding = null;

    if (fetcher) {
      isAdding = fetcher.submission?.formData.get('trackId') === track.id;
    } else if (fetcherRec) {
      isAdding = fetcherRec.submission?.formData.get('trackId') === track.id;
    }

    const isDone = fetcher
      ? fetcher.type === 'done' && isClicked
      : fetcherRec
      ? fetcherRec.type === 'done' && isClicked
      : null;
    let isError = null;

    if (fetcher && typeof fetcher.data === 'string' && isClicked) {
      if (fetcher.data.includes('Error') && isClicked) {
        isError = fetcher.data && isClicked;
      } else if (fetcherRec && typeof fetcherRec.data === 'string' && isClicked) {
        if (fetcherRec.data.includes('Error') && isClicked) {
          isError = fetcherRec.data && isClicked;
        }
      }
    }

    const icon = isAdding ? (
      <Waver />
    ) : isDone ? (
      <Check />
    ) : isError ? (
      <AlertCircle />
    ) : (
      <Send2 variant={isQueuing ? 'Outline' : 'Bold'} />
    );

    const width = w ?? '200px';

    return (
      <>
        <Stack
          as={motion.div}
          layoutId={list ? undefined : track.id + layoutKey}
          ref={ref}
          flex={list ? undefined : '0 0 200px'}
          direction={list ? 'row' : undefined}
          {...props}
          maxW={list ? '40px' : width}
        >
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
            <Tooltip label={track.albumName} placement="top-start">
              <Image
                as={motion.img}
                layoutId={list ? track.id + layoutKey : undefined}
                boxSize={list ? '40px' : width}
                minW={list ? '40px' : width}
                minH={list ? '40px' : width}
                objectFit="cover"
                src={track.image}
                draggable={false}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onClick={() => onClick(track, profileId, layoutKey, tracks, index?? 0)}
                cursor="pointer"
              />
            </Tooltip>
          </Flex>
          <Flex justify="space-between">
            <Stack
              spacing={0}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onClick={() => onClick(track, profileId, layoutKey, tracks, index?? 0)}
              cursor="pointer"
              w="175px"
            >
              <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-word">
                {track.name}
              </Text>
              {track.artist && (
                <Flex align="center">
                  {track.artistUri ? (
                    <Stack>
                      <Stack direction="row">
                        {track.explicit && <Image src={explicitImage} w="19px" mr="-3px" />}
                        <Text fontSize="11px" opacity={0.8} noOfLines={2}>
                          {track.artist}
                        </Text>
                      </Stack>
                      {isQueuing || isRecommending ? (
                        <SpotifyLogo w="70px" h="21px" white={inDrawer} />
                      ) : null}
                    </Stack>
                  ) : (
                    <Text fontSize="11px" opacity={0.8} noOfLines={2}>
                      {decodeHtmlEntity(track.artist)}
                    </Text>
                  )}
                </Flex>
              )}
            </Stack>
            <Stack>
              {isQueuing || isRecommending ? (
                <IconButton
                  onClick={handleSendButton}
                  pos="relative"
                  variant="ghost"
                  color={color}
                  icon={icon}
                  _hover={{ color: 'white' }}
                  aria-label={isQueuing ? 'add to this friends queue' : 'recommend to this friend'}
                />
              ) : (
                <SpotifyLogo icon mx="5px" white={inDrawer} />
              )}
            </Stack>
          </Flex>
        </Stack>
      </>
    );
  },
);

Tile.displayName = 'Tile';

export default Tile;
