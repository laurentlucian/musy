import { User } from 'react-feather';

import { Heading, Stack, Image, Text, HStack } from '@chakra-ui/react';

import type { Friends, Profile } from '@prisma/client';

import AcceptOrRejectFriendButton from './AcceptOrRejectFriendButton';

type PendingFriendsContainerType = {
    image: string;
    name: string;
    userId: string;
};

const PendingFriendsContainer = ({ image, name, userId }: PendingFriendsContainerType) => {
  //For each userId in friendsList, load their image, name, a button to accept or reject the friend request
  const ProfilePic = () => {
    return (
      <Image
        boxSize="50px"
        borderRadius="100%"
        minH="50px"
        minW="50px"
        src={image}
        mr={[0, '10px']}
      />
    );
  };

  const Username = () => {
    return (
      <Text fontWeight="bold" fontSize={['15px', '20px']}>
        {name}
      </Text>
    );
  };

  return (
    <HStack>
      <ProfilePic />
      <AcceptOrRejectFriendButton userId={userId} accept={true} />
      <AcceptOrRejectFriendButton userId={.userId} accept={false} />
    </HStack>
  );
};

export default PendingFriendsContainer;
