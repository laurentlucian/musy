import type { MetaFunction } from '@remix-run/node';

import { Box, Heading } from '@chakra-ui/react';

// https://remix.run/api/conventions#meta
export const meta: MetaFunction = () => {
  return {
    description: 'Working Page',
    title: 'A Page',
  };
};

export default function Page() {
  return <Heading size="md">I&apos;m a page!</Heading>;
}

export function CatchBoundary() {
  return (
    <Box bg="yellow.500">
      <Heading as="h2">I caught some condition</Heading>
    </Box>
  );
}

export function ErrorBoundary() {
  return (
    <Box bg="red.400" color="white">
      <Heading as="h2">Something is really wrong!</Heading>
    </Box>
  );
}
