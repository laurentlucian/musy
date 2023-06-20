import { isRouteErrorResponse, useRouteError } from '@remix-run/react';

import { Heading, HStack, Text } from '@chakra-ui/react';

import Forbidden from './Forbidden';
import NotFound from './NotFound';

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) return <NotFound />;
    if (error.status === 403) return <Forbidden />;
  } else if (error instanceof Error) {
    return (
      <>
        <HStack>
          <Heading fontSize={['sm', 'md']}>500 - </Heading>
          <Text fontSize="md">oops something broke :3</Text>
        </HStack>
        <Text fontSize="sm">Trace(for debug): {error.message}</Text>
      </>
    );
  }

  return (
    <HStack>
      <Heading fontSize={['sm', 'md']}>500 - </Heading>
      <Text fontSize="md">ooooooooooops unknown error</Text>
    </HStack>
  );
};
