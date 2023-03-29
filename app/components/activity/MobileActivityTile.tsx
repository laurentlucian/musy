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

import { useClickDrag, useDrawerTrack } from '~/hooks/useDrawer';
import type { Activity } from '~/lib/types/types';
import type { Track } from '~/lib/types/types';

import SpotifyLogo from '../icons/SpotifyLogo';
import Tooltip from '../Tooltip';
import { ActivityAction } from './ActivityTile';
import PlayedBy from './PlayedBy';

interface ActivityProps {
  activity: Activity;
  index: number;
  layoutKey: string;
  tracks: Track[];
}

const MobileActivityTile = ({ activity, index, layoutKey, tracks }: ActivityProps) => {
  const bg = useColorModeValue('music.200', 'music.900');
  const color = useColorModeValue('music.900', 'music.200');

  const { onClick, onMouseDown, onMouseMove } = useClickDrag();
  // eslint-disable-next-line
  const dontRemoveThis = useDrawerTrack();

  const item = {
    albumName: activity.track.albumName,
    albumUri: activity.track.albumUri,
    artist: activity.track.artist,
    artistUri: activity.track.artistUri,
    duration: 0,
    explicit: activity.track.explicit,
    id: activity.trackId,
    image: activity.track.image,
    link: activity.track.link,
    name: activity.track.name,
    preview_url: activity.track.preview_url,
    uri: activity.track.uri,
  };

  const liked = (activity.track.liked ?? []).filter(() => {
    if (activity.track.liked?.length === 1) return false;
    return true;
  });

  const played = activity.track.recent ?? [];

  return (
    <Stack py="6px" overflowX="hidden" bg={bg}>
      <ActivityAction activity={activity} />
      <Flex
        justify="space-between"
        bgColor={bg}
        w="100%"
        onClick={() => onClick(item, activity.user.userId, layoutKey, tracks, index)}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        cursor="pointer"
      >
        <Flex direction="column" w="100%" px={2} py={1}>
          <Tooltip label={item.name} placement="top-start">
            <Text
              fontSize={['12px', '13px']}
              noOfLines={1}
              whiteSpace="normal"
              wordBreak="break-word"
            >
              {item.name}
            </Text>
          </Tooltip>
          <Tooltip label={item.artist} placement="top-start">
            <Text fontSize={['9px', '10px']} opacity={0.6}>
              {item.artist}
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
          layoutId={item.id + layoutKey}
          boxSize="100px"
          objectFit="cover"
          src={item.image}
        />
      </Flex>
      <Divider opacity={0.5} w="100vw" pt="12px" color={color} />
    </Stack>
  );
};

export default MobileActivityTile;
