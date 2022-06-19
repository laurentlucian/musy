import { Progress, Text } from '@chakra-ui/react';
import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { authenticator, createUser, getUser, updateToken } from '~/services/auth.server';
import { commitSession, getSession } from '~/services/session.server';

export const loader: LoaderFunction = async ({ request }) => {
  const session = await authenticator.authenticate('spotify', request);
  if (!session || !session.user) {
    throw Error('No Session');
  }

  // https://github.com/sergiodxa/remix-auth#custom-redirect-url-based-on-the-user
  let _session = await getSession(request.headers.get('cookie'));
  _session.set(authenticator.sessionKey, session);
  let headers = new Headers({ 'Set-Cookie': await commitSession(_session) });

  const existingUser = await getUser(session.user.id);

  if (existingUser) {
    console.log('session.expiresAt', new Date(session.expiresAt).toLocaleString('en-US'));
    await updateToken(session.user.id, session.accessToken, session.expiresAt);
    return redirect('/', { headers });
  }

  if (!session.refreshToken || !session.tokenType || !session.user.name || !session.user.image) {
    throw Error('Missing User');
  }

  const user = {
    id: session.user.id,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
    tokenType: session.tokenType,
    user: {
      create: {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      },
    },
  };

  await createUser(user);

  return redirect('/', { headers });
};

const SpotifyCallback = () => {
  return <Progress size="xs" isIndeterminate />;
};

export const ErrorBoundary = ({ error }: any) => {
  console.log('error', error);
  return <Text color="white">Error authenticating. Spotify Premium account required.</Text>;
};

export default SpotifyCallback;
