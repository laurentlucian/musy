import { Text } from '@chakra-ui/react';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { authenticator, createUser, getUser, updateToken } from '~/services/auth.server';
import { commitSession, getSession, returnToCookie } from '~/services/session.server';

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const returnTo: string = (await returnToCookie.parse(request.headers.get('Cookie'))) ?? '/';
    const session = await authenticator.authenticate('spotify', request);
    if (!session || !session.user) {
      throw Error('spotify_callback -> no Session');
    }

    // https://github.com/sergiodxa/remix-auth#custom-redirect-url-based-on-the-user
    const _session = await getSession(request.headers.get('cookie'));
    _session.set(authenticator.sessionKey, session);
    const headers = new Headers({ 'Set-Cookie': await commitSession(_session) });

    const existingUser = await getUser(session.user.id);

    if (existingUser) {
      console.log(
        'spotify_callback -> session.expiresAt',
        new Date(session.expiresAt).toLocaleString('en-US'),
      );
      await updateToken(session.user.id, session.accessToken, session.expiresAt);

      return redirect(returnTo === '/' ? '/' + existingUser.id : returnTo, { headers });
    }

    if (!session.refreshToken || !session.tokenType || !session.user.name || !session.user.image) {
      console.log('spotify_callback -> missing session');
      return json({}, { status: 401 });
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

    const newUser = await createUser(user);
    return redirect(returnTo === '/' ? '/' + newUser.id : returnTo, { headers });
  } catch (e) {
    if (typeof e === 'string') {
      e.toUpperCase(); // narrowed to string
      console.log('spotify_callback -> caught error', e.toUpperCase());
    } else if (e instanceof Error) {
      console.log('spotify_callback -> caught error', e.message); // narrowed to Error
    }
    return json({}, { status: 401 });
  }
};

const SpotifyCallback = () => {
  const data = useLoaderData<{}>();
  console.log('data', data);
  // should only render when there's error
  return (
    <Text fontSize="14px" color="white">
      Only authorized users while in development {`:(`}
    </Text>
  );
};

export const ErrorBoundary = ({ error }: any) => {
  console.log('error', error);
  return (
    <Text fontSize="14px" color="white">
      Only authorized users while in development {`:(`}
    </Text>
  );
};

export default SpotifyCallback;
