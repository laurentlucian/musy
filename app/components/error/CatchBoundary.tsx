import { Heading, Text } from '@chakra-ui/react';
import { useCatch } from '@remix-run/react';

export const CatchBoundary = () => {
  let caught = useCatch();
  let message;
  switch (caught.status) {
    case 401:
      message = <Text>oops, you shouldn't be here (No access)</Text>;
      break;
    case 404:
      message = <Text>oops, you shouldn't be here (Page doesn't exist)</Text>;
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
    </>
  );
};
