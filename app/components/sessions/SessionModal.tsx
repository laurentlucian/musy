import type { StackProps } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';
import { VStack } from '@chakra-ui/react';
import { Avatar, Stack, HStack, Heading } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';

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

  return (
    <Stack bgColor="whiteAlpha.100" borderRadius="xl">
      <HStack spacing={2} align="center" p={3} justify="space-between">
        <HStack>
          <Avatar size="md" src={user.image} />
          <VStack align="flex-start" spacing={1}>
            <Heading size="md" fontWeight={400}>
              {name}
            </Heading>
            <Text fontSize={'sm'}>
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
