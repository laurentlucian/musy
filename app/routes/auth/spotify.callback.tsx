import { Progress, Text } from '@chakra-ui/react';
import type { LoaderFunction } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const auth = await authenticator.authenticate('spotify', request, {
      successRedirect: '/',
    });
    return auth;
  } catch (e) {
    throw new Error('Error authenticating. Spotify Premium account required.');
  }
};

const SpotifyCallback = () => {
  return <Progress size="xs" isIndeterminate />;
};

export const ErrorBoundary = ({ error }: any) => {
  return <Text color="white">{error.message}</Text>;
};

export default SpotifyCallback;
