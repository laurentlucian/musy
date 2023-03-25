import { useCatch, Link } from '@remix-run/react';

import { Button, Heading, Text } from '@chakra-ui/react';

export const CatchBoundary = () => {
  let caught = useCatch();
  let message;
  switch (caught.status) {
    case 401:
      message = <Text>oops, you shouldn&apos;t be here (No access)</Text>;
      break;
    case 404:
      message = <Text>oops, you shouldn&apos;t be here (Page doesn&apos;t exist)</Text>;
      break;
    case 429:
      message = <Text>oops, API suspended (too many requests)</Text>;
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <>
      <Heading fontSize={['sm', 'md']}>
        {caught.status}: {caught.statusText}
      </Heading>
      <Text fontSize="sm">{message}</Text>
      <Button mt={4} as={Link} to="/">
        Go home
      </Button>
    </>
  );
};
