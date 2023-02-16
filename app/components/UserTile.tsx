import { Link, type SubmitFunction, useLocation } from '@remix-run/react';
import type { DataFunctionArgs } from '@remix-run/server-runtime';
import { forwardRef, useRef } from 'react';
import { Check, AlertCircle } from 'react-feather';

import {
  Avatar,
  Button,
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
  bio?: string;
  id?: string;
  inDrawer?: boolean;

  playlist?: Boolean;
  submit?: SubmitFunction;
  userId?: string;
} & ChakraProps;

const UserTile = forwardRef<HTMLDivElement, TileProps>(
  (
    {
      bio,
      id,
      image,
      inDrawer,
      name,
      // playlist,
      submit,

      userId,
      ...props
    },
    ref,
  ) => {
    const decodeHtmlEntity = (str?: string) => {
      return str?.replace(/&#x([0-9A-Fa-f]+);/g, (_, dec) => {
        return String.fromCharCode(parseInt(dec, 16));
      });
    };
    const { onClick, onMouseDown, onMouseMove } = useClickDrag();

    return (
      <>
        <Stack ref={ref} direction="row" {...props}>
          <Flex direction="column">
            <Tooltip label={name} placement="top-start">
              <Avatar
                as={Link}
                to={`/${userId}`}
                boxSize="40px"
                minW="40px"
                minH="40px"
                objectFit="cover"
                src={image}
                draggable={false}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                cursor="pointer"
              />
            </Tooltip>
          </Flex>
          <Flex justify="space-between">
            <Stack
              as={Link}
              to={`/${userId}`}
              spacing={0}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              cursor="pointer"
            >
              <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-word">
                {name}
              </Text>
              <Stack>
                <Stack direction="row">
                  <Text fontSize="11px" opacity={0.8} noOfLines={1}>
                    {bio}
                  </Text>
                </Stack>
              </Stack>
            </Stack>
          </Flex>
        </Stack>
      </>
    );
  },
);

UserTile.displayName = 'UserTile';

export default UserTile;
