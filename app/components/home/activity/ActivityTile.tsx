import { Link } from '@remix-run/react';

import { HStack, Image, Stack, Text, Icon, Flex, Box, Link as ChakraLink } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';
import { motion } from 'framer-motion';
import { Send2, Star1 } from 'iconsax-react';

import { useFullscreen } from '~/components/fullscreen/Fullscreen';
import FullscreenTrack from '~/components/fullscreen/track/FullscreenTrack';
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

const UserInfo = ({ user }: { user: Profile }) => {
  return (
    <Link to={`/${user.userId}`}>
      <HStack>
        <Image
          minW="35px"
          maxW="35px"
          minH="35px"
          maxH="35px"
          borderRadius="100%"
          src={user.image}
        />
        <Stack spacing={0}>
          <Text fontWeight="bold" fontSize="xs">
            {user.name}
          </Text>
          <Text fontSize="9px">{user.bio}</Text>
        </Stack>
      </HStack>
    </Link>
  );
};

export const ActivityAction = ({ activity }: ActivityActionProps) => {
  return (
    <Flex justify="space-between" align="center">
      <UserInfo user={activity.user} />

      {activity.action === 'liked' && (
        <HStack align="center">
          <Text fontSize="10px" fontWeight="bolder">
            LIKED
          </Text>
          <LikeIcon aria-checked boxSize="20px" />
        </HStack>
      )}

      {activity.action === 'send' && (
        <HStack align="center">
          <Text fontSize="10px" fontWeight="bolder">
            SENT
          </Text>
          <Icon as={Send2} boxSize="20px" fill="white" />
          {activity.owner?.user && <UserInfo user={activity.owner.user} />}
        </HStack>
      )}

      {activity.action === 'recommend' && (
        <HStack align="center">
          <Text fontSize="10px" fontWeight="bolder">
            RECOMMENDED
          </Text>
          <Icon as={Star1} boxSize="20px" fill="white" />
        </HStack>
      )}
    </Flex>
  );
};

const ActivityTile = ({ activity, index, layoutKey, tracks }: ActivityProps) => {
  const track = tracks[index];
  const { onOpen } = useFullscreen();

  return (
    <Stack alignSelf="center">
      <ActivityAction activity={activity} />
      <Flex pb="5px">
        <Stack spacing="5px">
          <Flex>
            <Box
              as={motion.div}
              w="100%"
              // layoutId={track.id + layoutKey}
              cursor="pointer"
              onClick={() => onOpen(<FullscreenTrack track={track} />)}
            >
              <Image borderRadius="1px" w="100%" objectFit="cover" src={track.image} />
            </Box>
          </Flex>

          <Flex justify="space-between" align="start" p="5px">
            <HStack spacing={5}>
              {!!activity.track.liked?.length && <LikedBy liked={activity.track.liked} />}
              {!!activity.track.recent?.length && <PlayedBy played={activity.track.recent} />}
              {!!activity.track.queue?.length && <QueuedBy queued={activity.track.queue} />}
            </HStack>

            <SpotifyLogo icon w="21px" h="21px" />
          </Flex>

          <Flex justify="space-between" align="start" px="5px">
            <Stack spacing={0}>
              <ChakraLink
                href={track.uri}
                fontSize={['12px', '13px']}
                noOfLines={1}
                whiteSpace="normal"
                wordBreak="break-word"
              >
                {track.name}
              </ChakraLink>
              <HStack spacing={1}>
                <ChakraLink href={track.artistUri} fontSize={['9px', '10px']} opacity={0.6}>
                  {track.artist}
                </ChakraLink>
                <Box opacity={0.6}>•</Box>
                <ChakraLink href={track.albumUri} fontSize={['9px', '10px']} opacity={0.6}>
                  {track.albumName}
                </ChakraLink>
              </HStack>
              <Text fontSize={['8px', '9px']} opacity={0.6} w="100%">
                {timeSince(activity.createdAt)}
              </Text>
            </Stack>
          </Flex>
        </Stack>
      </Flex>
    </Stack>
  );
};

export default ActivityTile;
