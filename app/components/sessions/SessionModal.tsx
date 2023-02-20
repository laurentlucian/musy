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
  OrderedList,
  ListItem,
} from '@chakra-ui/react';

import type { Profile } from '@prisma/client';
import { People, VolumeHigh } from 'iconsax-react';

import { useMouseScroll } from '~/hooks/useMouseScroll';
import { timeSince } from '~/lib/utils';
import type { SessionsWithData } from '~/routes/home/sessions';

import ScrollButtons from '../tiles/ScrollButtons';

type SessionProps = {
  session: SessionsWithData[0];
  user: Profile;
} & StackProps;

const SessionModal = ({ children, session, user, ...chakraProps }: SessionProps) => {
  const { scrollRef } = useMouseScroll('natural', false);
  const [first, second = ''] = user.name.split(/[\s.]+/);
  const name = second.length > 4 || first.length >= 6 ? first : [first, second].join(' ');

  if (session.songs.length === 0) return null;

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
              {session.updatedAt > new Date(Date.now() - 1000 * 60 * 15) &&
              session.user.playback ? (
                <HStack>
                  <Icon as={VolumeHigh} />
                  <Icon as={People} cursor="pointer" />
                </HStack>
              ) : (
                <HStack w="100%" justify={'end'} pr={5}>
                  <OrderedList>
                    <ListItem fontSize="8px">Kanye</ListItem>
                    <ListItem fontSize="8px">Kanye</ListItem>
                    <ListItem fontSize="8px">Kanye</ListItem>
                  </OrderedList>
                </HStack>
              )}
            </HStack>
            <Text fontSize={'xs'} fontWeight="300">
              {timeSince(session.createdAt, 'minimal')} - {session.songs.length} songs
            </Text>
          </VStack>
        </HStack>
        <ScrollButtons scrollRef={scrollRef} />
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
