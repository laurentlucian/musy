import { Link } from '@remix-run/react';

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
  Box,
} from '@chakra-ui/react';

import { motion } from 'framer-motion';
import { Heart, Play, Send2 } from 'iconsax-react';

import { useClickDrag, useDrawerActions, useDrawerTrack } from '~/hooks/useDrawer';
import LikeIcon from '~/lib/icon/Like';
import type { Activity, Track } from '~/lib/types/types';
import { timeSince } from '~/lib/utils';

import SpotifyLogo from '../icons/SpotifyLogo';
import Tooltip from '../Tooltip';
import PlayedBy from './PlayedBy';

interface ActivityProps {
  activity: Activity;
  index: number;
  layoutKey: string;
  tracks: Track[];
}

const ActivityAction = ({ activity }: ActivityProps) => {
  return (
    <HStack>
      <>
        {(() => {
          switch (activity.action) {
            case 'liked':
              return (
                <>
                  <Tooltip label={activity.user?.name} placement="top-start">
                    <Link to={`/${activity.user?.userId}`}>
                      <Image
                        minW="25px"
                        maxW="25px"
                        minH="25px"
                        maxH="25px"
                        borderRadius="100%"
                        src={activity.user?.image}
                      />
                    </Link>
                  </Tooltip>
                  <LikeIcon aria-checked boxSize="18px" />
                </>
              );
            case 'send':
              return (
                <>
                  <Tooltip label={activity.user?.name} placement="top-start">
                    <Link to={`/${activity.user?.userId}`}>
                      <Image
                        minW="25px"
                        maxW="25px"
                        minH="25px"
                        maxH="25px"
                        borderRadius="100%"
                        src={activity.user?.image}
                      />
                    </Link>
                  </Tooltip>
                  <Icon as={Send2} boxSize="20px" fill="spotify.green" color="spotify.black" />
                  <Tooltip label={activity.owner?.user?.name} placement="top-start">
                    <Link to={`/${activity.owner?.user?.userId}`}>
                      <Image
                        minW="25px"
                        maxW="25px"
                        minH="25px"
                        maxH="25px"
                        borderRadius="100%"
                        src={activity.owner?.user?.image}
                      />
                    </Link>
                  </Tooltip>
                </>
              );
            case 'add':
              return (
                <>
                  <Tooltip label={activity.owner?.user?.name} placement="top-start">
                    <Link to={`/${activity.owner?.user?.userId}`}>
                      <Image
                        minW="25px"
                        maxW="25px"
                        minH="25px"
                        maxH="25px"
                        borderRadius="100%"
                        src={activity.owner?.user?.image}
                      />
                    </Link>
                  </Tooltip>
                  <Icon as={Play} boxSize="20px" fill="spotify.green" color="spotify.black" />
                  {activity.user && (
                    <Tooltip label={activity.user.name} placement="top-start">
                      <Link to={`/${activity.user.userId}`}>
                        <Image
                          minW="25px"
                          maxW="25px"
                          minH="25px"
                          maxH="25px"
                          borderRadius="100%"
                          src={activity.user.image}
                        />
                      </Link>
                    </Tooltip>
                  )}
                </>
              );
            default:
              return null;
          }
        })()}
        <Text fontSize={['9px', '10px']} opacity={0.6} w="100%">
          {timeSince(activity.createdAt)}
        </Text>
      </>
    </HStack>
  );
};

const ActivityTile = ({ activity, index, layoutKey, tracks }: ActivityProps) => {
  const bg = useColorModeValue('music.200', 'music.900');

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

  const liked = (activity.track.liked ?? []).filter(({ user }) => {
    if (activity.track.liked?.length === 1) return false;
    return true;
    // return user?.userId !== activity.user?.userId || user?.userId !== activity.owner?.user?.userId;
  });

  const played = activity.track.recent ?? [];
  //   ?.filter(({ user }) => {
  //   return (
  //     user?.userId !== activity.user?.userId || user?.userId !== activity.owner?.user?.userId
  //   );
  // });

  return (
    <Stack>
      <HStack>
        <ActivityAction activity={activity} layoutKey="Activity" tracks={tracks} index={index} />
      </HStack>
      <Flex
        justify="space-between"
        bgColor={bg}
        w="250px"
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
        <Box as={motion.div} layoutId={item.id + layoutKey} minW="100px">
          <Tooltip label={item.name} placement="top-start">
            <Image boxSize="100px" objectFit="cover" src={item.image} />
          </Tooltip>
        </Box>
      </Flex>
    </Stack>
  );
};

export default ActivityTile;
