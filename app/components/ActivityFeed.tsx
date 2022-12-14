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

type ActivityProps = {
  track: Activity;
};

const ActivityAction = ({ track }: ActivityProps) => {
  switch (track.action) {
    case 'liked':
      return (
        <HStack>
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
          <Text fontSize={['9px', '10px']} opacity={0.6} w="100%">
            {timeSince(track.createdAt)}
          </Text>
        </HStack>
      );
    case 'send':
      return (
        <HStack>
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
          <Text fontSize={['9px', '10px']} opacity={0.6} w="100%">
            {timeSince(track.createdAt)}
          </Text>
        </HStack>
      );
    case 'add':
      return (
        <HStack>
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
          <Text fontSize={['9px', '10px']} opacity={0.6} w="100%">
            {timeSince(track.createdAt)}
          </Text>
        </HStack>
      );
    default:
      return null;
  }
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
