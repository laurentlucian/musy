import {
  HStack,
  Image,
  Stack,
  Text,
  useColorModeValue,
  Icon,
  AvatarGroup,
  Avatar,
  Flex,
  Divider,
} from '@chakra-ui/react';

import { motion } from 'framer-motion';
import { Heart } from 'iconsax-react';

import Tooltip from '~/components/Tooltip';
import { useClickDrag, useExpandedTile } from '~/hooks/useExpandedTileState';
import SpotifyLogo from '~/lib/icons/SpotifyLogo';
import type { Activity } from '~/lib/types/types';
import type { Track } from '~/lib/types/types';

import { ActivityAction } from './ActivityTile';
import PlayedBy from './PlayedBy';

interface ActivityProps {
  activity: Activity;
  index: number;
  layoutKey: string;
  tracks: Track[];
}

const MobileActivityTile = ({ activity, index, layoutKey, tracks }: ActivityProps) => {
  const bg = useColorModeValue('musy.200', 'musy.900');
  const color = useColorModeValue('musy.900', 'musy.200');

  const { onClick, onMouseDown, onMouseMove } = useClickDrag();
  useExpandedTile();

  const liked = (activity.track.liked ?? []).filter(() => {
    if (activity.track.liked?.length === 1) return false;
    return true;
  });

  const played = activity.track.recent ?? [];

  return (
    <Stack pb="6px" overflowX="hidden" bg={bg}>
      <ActivityAction activity={activity} />
      <Flex
        justify="space-between"
        bgColor={bg}
        w="100%"
        onClick={() => onClick(tracks[index], activity.user.userId, layoutKey, tracks, index)}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        cursor="pointer"
      >
        <Flex direction="column" w="100%" px={2} py={1}>
          <Tooltip label={tracks[index].name} placement="top-start">
            <Text
              fontSize={['12px', '13px']}
              noOfLines={1}
              whiteSpace="normal"
              wordBreak="break-word"
            >
              {tracks[index].name}
            </Text>
          </Tooltip>
          <Tooltip label={tracks[index].artist} placement="top-start">
            <Text fontSize={['9px', '10px']} opacity={0.6}>
              {tracks[index].artist}
            </Text>
          </Tooltip>

          <Flex justify="space-between" mt="auto">
            <SpotifyLogo alignSelf="end" icon w="21px" h="21px" />
            <Stack spacing="2px">
              {liked.length ? (
                <HStack>
                  <Icon as={Heart} />
                  <AvatarGroup size="xs" max={5} spacing="-9px">
                    {liked.map(({ user }) => (
                      <Avatar
                        minW="20px"
                        maxW="20px"
                        minH="20px"
                        maxH="20px"
                        key={user?.userId}
                        name={user?.name}
                        src={user?.image}
                      />
                    ))}
                  </AvatarGroup>
                </HStack>
              ) : null}
              {played.length ? <PlayedBy played={played} /> : null}
            </Stack>
          </Flex>
        </Flex>
        <Image
          as={motion.img}
          layoutId={tracks[index].id + layoutKey}
          boxSize="100px"
          objectFit="cover"
          src={tracks[index].image}
        />
      </Flex>
      <Divider opacity={0.5} w="100vw" pt="12px" color={color} />
    </Stack>
  );
};

export default MobileActivityTile;
