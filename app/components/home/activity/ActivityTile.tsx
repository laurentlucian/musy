import { Link } from '@remix-run/react';

import { HStack, Image, Stack, Text, useColorModeValue, Icon, Flex, Box } from '@chakra-ui/react';

import { motion } from 'framer-motion';
import { Send2, Star1 } from 'iconsax-react';

import QueueToSelf from '~/components/profile/tiles/expandedTile/menu/actions/QueueToSelf';
import Tooltip from '~/components/Tooltip';
import { useClickDrag, useExpandedTile } from '~/hooks/useExpandedTileState';
import LikeIcon from '~/lib/icons/Like';
import SpotifyLogo from '~/lib/icons/SpotifyLogo';
import type { Activity, Track } from '~/lib/types/types';
import { timeSince } from '~/lib/utils';

import LikedBy from './LikedBy';
import PlayedBy from './PlayedBy';
import QueuedBy from './QueuedBy';

type ActivityActionProps = {
  activity: Activity;
};
interface ActivityProps extends ActivityActionProps {
  index: number;
  layoutKey: string;
  tracks: Track[];
}

type UserIconProps = {
  id: string | undefined;
  image: string | undefined;
  name: string | undefined;
};

const UserIcon = ({ id, image, name }: UserIconProps) => {
  return (
    <Tooltip label={name}>
      <Link to={`/${id}`}>
        <Image minW="25px" maxW="25px" minH="25px" maxH="25px" borderRadius="100%" src={image} />
      </Link>
    </Tooltip>
  );
};

export const ActivityAction = ({ activity }: ActivityActionProps) => {
  return (
    <HStack>
      {(() => {
        switch (activity.action) {
          case 'liked':
            return (
              <>
                <UserIcon
                  id={activity.user?.userId}
                  name={activity.user?.name}
                  image={activity.user?.image}
                />
                <LikeIcon aria-checked boxSize="18px" />
              </>
            );
          case 'send':
            return (
              <>
                <UserIcon
                  id={activity.user?.userId}
                  name={activity.user?.name}
                  image={activity.user?.image}
                />
                <Tooltip label="sent">
                  <Icon as={Send2} boxSize="20px" fill="spotify.green" color="spotify.black" />
                </Tooltip>
                <UserIcon
                  id={activity.owner?.user?.userId}
                  name={activity.owner?.user?.name}
                  image={activity.owner?.user?.image}
                />
              </>
            );
          case 'recommend':
            return (
              <>
                <UserIcon
                  id={activity.user?.userId}
                  name={activity.user?.name}
                  image={activity.user?.image}
                />
                <Tooltip label="recommended">
                  <Icon as={Star1} boxSize="20px" fill="spotify.green" color="spotify.black" />
                </Tooltip>
              </>
            );
          default:
            return null;
        }
      })()}
      <Text fontSize={['9px', '10px']} opacity={0.6} w="100%">
        {timeSince(activity.createdAt)}
      </Text>
    </HStack>
  );
};

const ActivityTile = ({ activity, index, layoutKey, tracks }: ActivityProps) => {
  const bg = useColorModeValue('musy.200', 'musy.800');

  const { onClick, onMouseDown, onMouseMove } = useClickDrag();
  useExpandedTile();

  return (
    <Stack>
      <ActivityAction activity={activity} />
      <Flex bgColor={bg} pb="5px">
        <Stack spacing="5px">
          <Flex>
            <Box
              as={motion.div}
              w="120px"
              layoutId={tracks[index].id + layoutKey}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onClick={() => onClick(tracks[index], activity.user.userId, layoutKey, tracks, index)}
            >
              <Tooltip label={tracks[index].albumName} placement="top-start">
                <Image w="100%" objectFit="cover" src={tracks[index].image} />
              </Tooltip>
            </Box>
            <Flex direction="column" px={['5px', '15px']} justify="space-between">
              <QueueToSelf
                trackId={tracks[index].id}
                variant="musy"
                size="xs"
                fontSize="11px"
                display="flex"
                justifyContent="center"
                minW="95px"
                mt={['10px', '15px']}
              />
              <Stack spacing={1}>
                {activity.track.liked?.length && <LikedBy liked={activity.track.liked} />}
                {activity.track.queue?.length && <QueuedBy queued={activity.track.queue} />}
                {activity.track.recent?.length && <PlayedBy played={activity.track.recent} />}
              </Stack>
            </Flex>
          </Flex>

          <Flex justify="space-between" align="center" px={'5px'}>
            <Flex direction="column">
              <Tooltip
                label={tracks[index].name.length > 17 ? tracks[index].name : undefined}
                placement="top-start"
              >
                <Text
                  fontSize={['12px', '13px']}
                  noOfLines={1}
                  whiteSpace="normal"
                  wordBreak="break-word"
                >
                  {tracks[index].name}
                </Text>
              </Tooltip>
              <Tooltip
                label={tracks[index].artist.length > 17 ? tracks[index].artist : undefined}
                placement="top-start"
              >
                <Text fontSize={['9px', '10px']} opacity={0.6}>
                  {tracks[index].artist}
                </Text>
              </Tooltip>
            </Flex>

            <SpotifyLogo icon w="21px" h="21px" />
          </Flex>
        </Stack>
      </Flex>
    </Stack>
  );
};

export default ActivityTile;
