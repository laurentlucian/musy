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
  VStack,
} from '@chakra-ui/react';
import type { Activity, Track } from '~/lib/types/types';
import { useDrawerActions } from '~/hooks/useDrawer';
import { Heart, Play, Send2 } from 'iconsax-react';
import SpotifyLogo from './icons/SpotifyLogo';
import PlayedBy from './activity/PlayedBy';
import { Link } from '@remix-run/react';
import { timeSince } from '~/lib/utils';
import LikeIcon from '~/lib/icon/Like';
import Tooltip from './Tooltip';

interface ActivityProps {
  activity: Activity;
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

const ActivityTile = ({ activity }: ActivityProps) => {
  const bg = useColorModeValue('music.900', 'music.200');

  const { onOpen } = useDrawerActions();

  const item: Track = {
    uri: activity.track.uri,
    trackId: activity.trackId ?? '',
    image: activity.track.image,
    albumUri: activity.track.albumUri,
    albumName: activity.track.albumName,
    name: activity.track.name,
    artist: activity.track.artist,
    artistUri: activity.track.artistUri,
    explicit: activity.track.explicit,
    userId: activity.user?.userId,
    preview_url: '',
    link: activity.track.link,
  };

  const liked = activity.track.liked ?? [];

  // ?.filter(({ user }) => {
  //   return (
  //     user?.userId !== activity.user?.userId || user?.userId !== activity.owner?.user?.userId
  //   );
  // });

  const played = activity.track.recent ?? [];
  //   ?.filter(({ user }) => {
  //   return (
  //     user?.userId !== activity.user?.userId || user?.userId !== activity.owner?.user?.userId
  //   );
  // });

  return (
    <Stack>
      <HStack>
        <ActivityAction activity={activity} />
      </HStack>
      <Flex
        justify="space-between"
        bgColor={bg}
        w="250px"
        onClick={() => onOpen(item)}
        cursor="pointer"
      >
        <Flex direction="column" px={2} py={1}>
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

          <HStack align="end" h="50%">
            <SpotifyLogo icon w="21px" h="21px" />

            {/* {liked.length ? (
              <HStack>
                <Icon as={Heart} />
                <AvatarGroup size="xs" max={5}>
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
            {played.length ? <PlayedBy played={played} /> : null} */}
          </HStack>
        </Flex>
        <Tooltip label={item.name} placement="top-start">
          <Image boxSize="100px" objectFit="cover" src={item.image} />
        </Tooltip>
      </Flex>
    </Stack>
  );
};

export default ActivityTile;
