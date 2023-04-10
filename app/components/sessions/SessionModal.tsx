import { Link } from '@remix-run/react';

import {
  Text,
  VStack,
  Avatar,
  Stack,
  Icon,
  HStack,
  Heading,
  type StackProps,
  Box,
  Flex,
  Badge,
} from '@chakra-ui/react';

import { People, VolumeHigh } from 'iconsax-react';

import { useMouseScroll } from '~/hooks/useMouseScroll';
import { shortenUsername, timeSince } from '~/lib/utils';
import type { SessionsWithData } from '~/routes/home/sessions';

type SessionProps = {
  session: SessionsWithData[0];
} & StackProps;

const SessionModal = ({ children, session, ...chakraProps }: SessionProps) => {
  const { scrollRef } = useMouseScroll('natural', false);
  const user = session.user;

  const name = shortenUsername(user.name);
  if (session.songs.length === 0) return null;

  const mostPlayedArtists = session.songs.reduce((acc, song) => {
    const artist = song.track.artist;
    if (acc[artist]) {
      acc[artist] += 1;
    } else {
      acc[artist] = 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const sortedArtists = Object.entries(mostPlayedArtists).sort((a, b) => b[1] - a[1]);

  const isPlaying = session.updatedAt > new Date(Date.now() - 1000 * 60 * 5);

  return (
    <Stack bgColor="whiteAlpha.100" borderRadius="xl">
      <HStack spacing={2} align="center" p={3} justify="space-between">
        <HStack spacing={3} w="100%">
          <Link to={`/${user.userId}`}>
            <Avatar size="md" src={user.image} />
          </Link>
          <VStack align="flex-start" spacing={1} w="100%">
            <HStack w="100%">
              <Link to={`/${user.userId}`}>
                <Heading size="sm" fontWeight={400}>
                  {name}
                </Heading>
              </Link>
              {isPlaying ? (
                <HStack>
                  <Icon as={VolumeHigh} />
                  <Icon as={People} cursor="pointer" />
                </HStack>
              ) : null}
            </HStack>
            <Text fontSize={'xs'} fontWeight="300">
              {timeSince(session.createdAt, 'minimal')} - {session.songs.length} songs
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={5} align="flex-start" display={{ base: 'none', lg: 'flex' }}>
          <Box w={300}>
            {sortedArtists.slice(0, 2).map(([artistName, plays], index) => (
              <Flex
                key={artistName}
                alignItems="center"
                py={2}
                borderBottomWidth={index < sortedArtists.length - 1 ? '1px' : '0'}
                borderBottomColor="whiteAlpha.300"
              >
                <Badge
                  mr={2}
                  variant="subtle"
                  colorScheme={index === 0 ? 'yellow' : index === 1 ? 'gray' : 'red'}
                >
                  {index + 1}
                </Badge>
                <Text flex={1} fontSize="sm" fontWeight="medium">
                  {artistName}
                </Text>
                <Text flexShrink={0} fontSize="xs" fontWeight="medium">
                  {plays.toLocaleString()}x
                </Text>
              </Flex>
            ))}
          </Box>
          <Box w={300}>
            {sortedArtists.slice(2, 4).map(([artistName, plays], index) => (
              <Flex
                key={artistName}
                alignItems="center"
                py={2}
                borderBottomWidth={index < sortedArtists.length - 1 ? '1px' : '0'}
                borderBottomColor="whiteAlpha.300"
              >
                <Badge mr={2} variant="solid" colorScheme="blackAlpha">
                  {index + 3}
                </Badge>
                <Text flex={1} fontSize="sm" fontWeight="medium">
                  {artistName}
                </Text>
                <Text flexShrink={0} fontSize="xs" fontWeight="medium">
                  {plays.toLocaleString()}x
                </Text>
              </Flex>
            ))}
          </Box>
        </HStack>
      </HStack>
      <HStack
        spacing={1}
        m={2}
        py={2}
        maxH="300px"
        className="scrollbar"
        ref={scrollRef}
        overflow="auto"
        align="flex-start"
        {...chakraProps}
      >
        {children}
      </HStack>
    </Stack>
  );
};

export default SessionModal;
