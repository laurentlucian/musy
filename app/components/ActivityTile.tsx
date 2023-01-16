import {
  HStack,
  Image,
  Stack,
  Text,
  useColorModeValue,
  Icon,
  AvatarGroup,
  Avatar,
} from '@chakra-ui/react';
import { Link } from '@remix-run/react';
import Tooltip from './Tooltip';
import { timeSince } from '~/lib/utils';
import { Play, Send2 } from 'iconsax-react';
import LikeIcon from '~/lib/icon/Like';
import type { Activity, Track } from '~/lib/types/types';
import { useDrawerActions } from '~/hooks/useDrawer';

interface ActivityProps {
  activity: Activity;
}

const ActivityAction = ({ activity }: ActivityProps) => {
  const users = activity.likedBy?.filter((user) => user.userId !== activity.user?.userId) ?? [];

  return (
    <HStack>
      <>
        {(() => {
          switch (activity.action) {
            case 'liked':
              return (
                <>
                  <HStack align="center">
                    <AvatarGroup>
                      {users.map((user) => (
                        <Avatar
                          minW="29px"
                          maxW="29px"
                          minH="29px"
                          maxH="29px"
                          key={user.userId}
                          name={user.name}
                          src={user.image}
                          size={['xs', null, 'sm']}
                        />
                      ))}
                    </AvatarGroup>
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
                  </HStack>
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
  };

  return (
    <>
      <Stack w="220px">
        <HStack>
          <ActivityAction activity={activity} />
        </HStack>
        <HStack
          borderRadius={5}
          bgColor={bg}
          w="100%"
          pl={2}
          onClick={() => onOpen(item)}
          cursor="pointer"
        >
          <Stack spacing={0} px={2} w="200px">
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
          </Stack>
          <Tooltip label={item.name} placement="top-start">
            <Image boxSize="70px" objectFit="cover" src={item.image} />
          </Tooltip>
        </HStack>
      </Stack>
    </>
  );
};

export default ActivityTile;
