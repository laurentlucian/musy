import { Link, type SubmitFunction, useLocation } from '@remix-run/react';
import type { DataFunctionArgs } from '@remix-run/server-runtime';
import { forwardRef, useRef, useState } from 'react';
import { Check, AlertCircle } from 'react-feather';

import { Flex, HStack, IconButton, Image, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';
import { Send2 } from 'iconsax-react';
import type { TypedFetcherWithComponents, TypedJsonResponse } from 'remix-typedjson';

import explicitImage from '~/assets/explicit-solid.svg';
import { useClickDrag } from '~/hooks/useDrawer';
import type { Track, User } from '~/lib/types/types';
import { timeSince } from '~/lib/utils';

import SpotifyLogo from './icons/SpotifyLogo';
import Waver from './icons/Waver';
import Tooltip from './Tooltip';

type TileProps = Track & {
  createdAt?: Date;
  // will show header (profile above tile) if createdAt is defined
  createdBy?: Profile | null;
  currentUser?: User | null;
  currentUserId?: string | undefined;
  fetcher?: TypedFetcherWithComponents<
    ({ params, request }: DataFunctionArgs) => Promise<TypedJsonResponse<string>>
  >;
  id?: string;
  playlist?: Boolean;
  submit?: SubmitFunction;
  inDrawer?: boolean;
  isQueuing?: boolean;
  isRecommending?: boolean;
} & ChakraProps;

const Tile = forwardRef<HTMLDivElement, TileProps>(
  (
    {
      albumName,
      albumUri,
      artist,
      artistUri,
      createdAt,
      createdBy,
      currentUser,
      currentUserId,
      explicit,
      fetcher,
      id,
      image,
      link,
      name,
      playlist,
      preview_url,
      submit,
      trackId,
      uri,
      inDrawer,
      isQueuing,
      isRecommending,
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
    const track: Track = {
      albumName,
      albumUri,
      artist,
      artistUri,
      explicit,
      image,
      link,
      name,
      preview_url,
      trackId,
      uri: uri,
    };
    const clickedRef = useRef<string>();
    const handleSendButton = () => {
      if (!currentUser && submit) {
        console.log('you made it here0');
        // @todo figure out a better way to require authentication on click;
        // after authentication redirect, add to queue isn't successful. user needs to click again
        return submit(null, {
          action: '/auth/spotify?returnTo=' + pathname + search,
          method: 'post',
          replace: true,
        });
      }

      clickedRef.current = trackId;
      const action = isRecommending ? `/${id}/recommend` : `/${id}/add`;

      const fromUserId = currentUser?.userId || currentUserId;
      const sendToUserId = id;

      const queueData = {
        action: 'send',

        fromId: fromUserId ?? '',
        toId: sendToUserId ?? '',
        trackId: trackId ?? '',
      };

      const recommendData = {
        action: 'recommend',
        albumName: track?.albumName ?? '',
        albumUri: track?.albumUri ?? '',
        artist: track?.artist ?? '',
        artistUri: track?.artistUri ?? '',
        comment: '',
        explicit: track?.explicit ? 'true' : '',
        fromId: fromUserId ?? '',
        image: track?.image ?? '',
        link: track?.link ?? '',
        name: track?.name ?? '',
        preview_url: track?.preview_url ?? '',

        toId: sendToUserId ?? '',
        trackId: track?.trackId ?? '',
        uri: track?.uri ?? '',
      };
      if (fetcher && isQueuing) {
        fetcher.submit(queueData, { action, method: 'post', replace: true });
      }
      if (fetcher && isRecommending) {
        fetcher.submit(recommendData, { action, method: 'post', replace: true });
      }
    };
    const isClicked = clickedRef.current === trackId;
    const isAdding = fetcher ? fetcher.submission?.formData.get('trackId') === trackId : null;
    const isDone = fetcher ? fetcher.type === 'done' && isClicked : null;
    const isError = fetcher
      ? typeof fetcher.data === 'string' && isClicked
        ? fetcher.data.includes('Error') && isClicked
          ? fetcher.data && isClicked
          : null
        : null
      : null;

    const icon = isAdding ? (
      <Waver />
    ) : isDone ? (
      <Check />
    ) : isError ? (
      <AlertCircle />
    ) : (
      <Send2 variant={isQueuing ? 'Outline' : 'Bold'} />
    );
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
                      {isQueuing || isRecommending ? (
                        <SpotifyLogo w="70px" h="21px" white={inDrawer} />
                      ) : null}
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
