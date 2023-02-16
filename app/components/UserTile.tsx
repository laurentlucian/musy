import { Link, type SubmitFunction, useLocation } from '@remix-run/react';
import type { DataFunctionArgs } from '@remix-run/server-runtime';
import { forwardRef, useRef } from 'react';
import { Check, AlertCircle } from 'react-feather';

import {
  Avatar,
  Flex,
  HStack,
  IconButton,
  Image,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
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
  fetcherRec?: TypedFetcherWithComponents<
    ({ params, request }: DataFunctionArgs) => Promise<TypedJsonResponse<string>>
  >;
  id?: string;
  inDrawer?: boolean;
  isQueuing?: boolean;
  isRecommending?: boolean;
  list?: boolean;

  playlist?: Boolean;
  submit?: SubmitFunction;
} & ChakraProps;

const UserTile = forwardRef<HTMLDivElement, TileProps>(
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
      fetcherRec,
      id,
      image,
      inDrawer,
      isQueuing,
      isRecommending,
      link,
      list,
      name,
      // playlist,
      preview_url,
      submit,
      trackId,
      uri,
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
    const track = {
      albumName,
      albumUri,
      artist,
      artistUri,
      duration: 0,
      explicit,
      id: trackId,
      image,
      link,
      name,
      preview_url,
      uri,
    };
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
        trackId: track?.id ?? '',
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
    const isAdding = fetcher
      ? fetcher.submission?.formData.get('trackId') === trackId
      : fetcherRec
      ? fetcherRec.submission?.formData.get('trackId') === trackId
      : null;
    const isDone = fetcher
      ? fetcher.type === 'done' && isClicked
      : fetcherRec
      ? fetcherRec.type === 'done' && isClicked
      : null;
    const isError = fetcher
      ? typeof fetcher.data === 'string' && isClicked
        ? fetcher.data.includes('Error') && isClicked
          ? fetcher.data && isClicked
          : fetcherRec
          ? typeof fetcherRec.data === 'string' && isClicked
            ? fetcherRec.data.includes('Error') && isClicked
              ? fetcherRec.data && isClicked
              : null
            : null
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
        <Stack ref={ref} direction="row" {...props}>
          <Flex direction="column">
            <Tooltip label={albumName} placement="top-start">
              <Avatar
                boxSize="40px"
                minW="40px"
                minH="40px"
                objectFit="cover"
                src={image}
                draggable={false}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onClick={() => onClick(track)}
                cursor="pointer"
              />
            </Tooltip>
          </Flex>
          <Flex justify="space-between">
            <Stack
              spacing={0}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onClick={() => onClick(track)}
              cursor="pointer"
            >
              <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-word">
                {name}
              </Text>
              <Stack>
                <Stack direction="row">
                  <Text fontSize="11px" opacity={0.8} noOfLines={1}>
                    {artist}
                  </Text>
                </Stack>
              </Stack>
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

UserTile.displayName = 'UserTile';

export default UserTile;
