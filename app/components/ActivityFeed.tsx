import {
  HStack,
  Image,
  Stack,
  Text,
  Link as LinkB,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { Link } from '@remix-run/react';
import Tooltip from './Tooltip';
import { timeSince } from '~/hooks/utils';
import type { Activity } from '~/routes';
import { Play, Send2 } from 'iconsax-react';
import ActionMenu from './menu/ActionMenu';

type ActivityProps = {
  track: Activity;
};

const ActivityAction = ({ track }: ActivityProps) => {
  const Action = () => {
    switch (track.action) {
      case 'liked':
        return (
          <>
            <Tooltip label={track.user?.name} placement="top-start">
              <Link to={`/${track.user?.userId}`}>
                <Image
                  minW="25px"
                  maxW="25px"
                  minH="25px"
                  maxH="25px"
                  borderRadius="100%"
                  src={track.user?.image}
                />
              </Link>
            </Tooltip>
            <Image w="15px" src="heart.svg" />
          </>
        );
      case 'send':
        return (
          <>
            <Tooltip label={track.user?.name} placement="top-start">
              <Link to={`/${track.user?.userId}`}>
                <Image
                  minW="25px"
                  maxW="25px"
                  minH="25px"
                  maxH="25px"
                  borderRadius="100%"
                  src={track.user?.image}
                />
              </Link>
            </Tooltip>
            <Icon as={Send2} boxSize="20px" fill="spotify.green" color="spotify.black" />
            <Tooltip label={track.owner?.user.name} placement="top-start">
              <Link to={`/${track.owner?.user.userId}`}>
                <Image
                  minW="25px"
                  maxW="25px"
                  minH="25px"
                  maxH="25px"
                  borderRadius="100%"
                  src={track.owner?.user.image}
                />
              </Link>
            </Tooltip>
          </>
        );
      case 'add':
        return (
          <>
            <Tooltip label={track.owner?.user.name} placement="top-start">
              <Link to={`/${track.owner?.user.userId}`}>
                <Image
                  minW="25px"
                  maxW="25px"
                  minH="25px"
                  maxH="25px"
                  borderRadius="100%"
                  src={track.owner?.user.image}
                />
              </Link>
            </Tooltip>
            <Icon as={Play} boxSize="20px" fill="spotify.green" color="spotify.black" />
            {track.user && (
              <Tooltip label={track.user.name} placement="top-start">
                <Link to={`/${track.user.userId}`}>
                  <Image
                    minW="25px"
                    maxW="25px"
                    minH="25px"
                    maxH="25px"
                    borderRadius="100%"
                    src={track.user.image}
                  />
                </Link>
              </Tooltip>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <HStack>
      <Action />
      <Text fontSize={['9px', '10px']} opacity={0.6} w="100%">
        {timeSince(track.createdAt)}
      </Text>
      {track.trackId && (
        <ActionMenu
          track={{
            uri: track.uri,
            trackId: track.trackId,
            name: track.name,
            artist: track.artist,
            artistUri: track.artistUri,
            albumName: track.albumName,
            albumUri: track.albumUri,
            explicit: track.explicit,
            image: track.image,
            userId: track.user?.userId,
          }}
          placement="bottom-end"
          ml="auto !important"
        />
      )}
    </HStack>
  );
};

const ActivityFeed = ({ track }: ActivityProps) => {
  const bg = useColorModeValue('music.200', 'music.900');

  return (
    <Stack pr={'6.9px'}>
      <ActivityAction track={track} />
      <HStack borderRadius={5} bgColor={bg} w="100%" pl={2}>
        <Stack spacing={0} px={2} w="200px">
          <Tooltip label={track.name} placement="top-start">
            <LinkB href={track.uri}>
              <Text
                fontSize={['12px', '13px']}
                noOfLines={1}
                whiteSpace="normal"
                wordBreak="break-word"
              >
                {track.name}
              </Text>
            </LinkB>
          </Tooltip>
          <LinkB href={track.artistUri ?? ''}>
            <Tooltip label={track.artist} placement="top-start">
              <Text fontSize={['9px', '10px']} opacity={0.6}>
                {track.artist}
              </Text>
            </Tooltip>
          </LinkB>
        </Stack>
        <HStack w="55%" justify="end">
          <LinkB href={track.albumUri ?? ''} target="_blank">
            <Tooltip label={track.name} placement="top-start">
              <Image w="100%" src={track.image} />
            </Tooltip>
          </LinkB>
        </HStack>
      </HStack>
    </Stack>
  );
};

export default ActivityFeed;
