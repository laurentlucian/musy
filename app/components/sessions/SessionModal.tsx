import type { ReactNode } from 'react';

import {
  Avatar,
  Stack,
  StackProps,
  HStack,
  Heading,
  Divider,
  IconButton,
  OrderedList,
  ListItem,
} from '@chakra-ui/react';

import { PlayAdd } from 'iconsax-react';

type SessionUser = {
  image: string;
  name: string;
  userId: string;
};

type SessionProps = {
  Filter?: ReactNode;
  autoScroll?: boolean;

  //   children: ReactNode;
  scrollButtons?: boolean;
  setShow?: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
  user?: SessionUser;
} & StackProps;

const SessionModal = ({
  Filter = null,
  children,
  setShow,
  title,
  user,
  ...ChakraProps
}: SessionProps) => {
  //   const { props, scrollRef } = useMouseScroll('natural', autoScroll);
  const onClick = () => {
    if (setShow) setShow(true);
  };

  const test = true;

  const header = test
    ? `${user?.name} started listening to music ${title}`
    : `${user?.name}'s session ${title}`;

  const joinSession = () => {
    alert('join session');
  };

  const data = [1, 2, 3];

  return (
    <Stack bgColor="whiteAlpha.100" borderRadius="xl">
      <HStack spacing={2} align="center" p={3} justify="space-between">
        {user && (
          <>
            <HStack>
              <Avatar size="md" src={user.image} />
              <Heading fontSize={['xs', 'sm']} fontWeight="200" onClick={onClick} cursor="pointer">
                {header}
              </Heading>
            </HStack>
            {test ? (
              <Stack>
                <IconButton
                  aria-label="play-add"
                  as={PlayAdd}
                  name="play-add"
                  size="24px"
                  _hover={{ color: 'spotify.green' }}
                  cursor="pointer"
                  onClick={joinSession}
                />
              </Stack>
            ) : (
              <OrderedList spacing={1}>
                {data.map(() => (
                  <ListItem key={''} fontSize="10px" fontWeight="200">
                    Drake
                  </ListItem>
                ))}
              </OrderedList>
            )}
          </>
        )}

        {Filter}
      </HStack>
      <Divider h="2px" bgColor="black" />
      <Stack
        px={3}
        maxH="300px"
        className="scrollbar"
        overflow="scroll"
        align="flex-start"
        {...ChakraProps}
      >
        {children}
      </Stack>
    </Stack>
  );
};

export default SessionModal;
