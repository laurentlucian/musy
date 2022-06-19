import { Progress, Text } from '@chakra-ui/react';
import type { LoaderFunction } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  const auth = await authenticator.authenticate('spotify', request, {
    successRedirect: '/',
  });
  return auth;
};

const SpotifyCallback = () => {
  return <Progress size="xs" isIndeterminate />;
};

export const ErrorBoundary = ({ error }: any) => {
  return <Text color="white">Error authenticating. Spotify Premium account required.</Text>;
};

export default SpotifyCallback;
