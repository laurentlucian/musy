import { Link as RouterLink } from 'react-router-dom';

import { Flex, Image, Text, Box, Spacer, HStack, Link } from '@chakra-ui/react';

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
      <>
        <Link as={RouterLink} to={`/${userId}`}>
          <Image
            boxSize="50px"
            borderRadius="100%"
            minH="50px"
            minW="50px"
            src={image}
            mr={[0, '10px']}
          />
        </Link>
      </>
    );
  };

  const Username = () => {
    return (
      <>
        <Link as={RouterLink} to={`/${userId}`}>
          <Text fontWeight="bold" fontSize={['15px', '20px']} maxWidth="500px">
            {name}
          </Text>
        </Link>
      </>
    );
  };

  return (
    <>
      <Flex padding="10px">
        <Box>
          <HStack>
            <ProfilePic />
            <Username />
          </HStack>
        </Box>
        <Spacer />
        <Box>
          <AcceptOrRejectFriendButton userId={userId} accept={true} />
          <AcceptOrRejectFriendButton userId={userId} accept={false} />
        </Box>
      </Flex>
    </>
  );
};

export default PendingFriendsContainer;
