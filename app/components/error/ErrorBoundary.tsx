import { Heading, HStack, Text } from '@chakra-ui/react';

export const ErrorBoundary = ({ error }: { error: Error }) => {
  console.log('index -> ErrorBoundary', error, error.message, error.stack);
  return (
    <>
      <HStack>
        <Heading fontSize={['sm', 'md']}>500 - </Heading>
        <Text fontSize="md">oops something broke :3</Text>
      </HStack>
      <Text fontSize="sm">Trace(for debug): {error.message}</Text>
    </>
  );
};
