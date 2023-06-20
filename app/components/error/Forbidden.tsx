import { Link } from '@remix-run/react';

import { Button, HStack, Heading, Text } from '@chakra-ui/react';

const Forbidden = () => {
  return (
    <>
      <HStack>
        <Heading fontSize={['sm', 'md']}>401 - </Heading>
        <Text fontSize="md">Not authorized</Text>
      </HStack>
      <Button as={Link} to="/">
        Take me home
      </Button>
    </>
  );
};

export default Forbidden;
