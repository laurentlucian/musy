import { Link } from '@remix-run/react';

import { Button, HStack, Heading, Text } from '@chakra-ui/react';

const NotFound = () => {
  return (
    <>
      <HStack>
        <Heading fontSize={['sm', 'md']}>404 - </Heading>
        <Text fontSize="md">Page not found</Text>
      </HStack>
      <Button as={Link} to="/">
        Take me home
      </Button>
    </>
  );
};

export default NotFound;
