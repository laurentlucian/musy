import { Text } from '@chakra-ui/react';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { commitSession, getSession, returnToCookie } from '~/services/session.server';

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const returnTo: string = (await returnToCookie.parse(request.headers.get('Cookie'))) ?? '/';
    const session = await authenticator.authenticate('spotify', request);
    if (!session || !session.user) {
      return redirect('/');
    }

    // https://github.com/sergiodxa/remix-auth#custom-redirect-url-based-on-the-user
    const _session = await getSession(request.headers.get('cookie'));
    _session.set(authenticator.sessionKey, session);
    const headers = new Headers({ 'Set-Cookie': await commitSession(_session) });

    return redirect(returnTo === '/' ? '/' + session.user.id : returnTo, { headers });
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
