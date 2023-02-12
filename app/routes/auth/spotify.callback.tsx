import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useCatch } from '@remix-run/react';

import { Heading, Text } from '@chakra-ui/react';

import { authenticator } from '~/services/auth.server';
import { commitSession, getSession, returnToCookie } from '~/services/session.server';

export default () => null;

export const loader: LoaderFunction = async ({ request }) => {
  const returnTo: string = (await returnToCookie.parse(request.headers.get('Cookie'))) ?? '/';
  const session = await authenticator.authenticate('spotify', request).catch(async (e) => {
    if (e instanceof Response) {
      const message = await e.text();
      console.log('authenticator.authenticate -> catch', e.status, message);
      // returning 401 unauthorized as authenticator crashes on any error by spotify api without info
      // @todo fix spotify stragegy to return proper error
      throw json({}, { status: 401, statusText: message });
    }
    throw json({}, { status: 401 });
  });
  if (!session || !session.user) {
    return redirect('/');
  }

  // https://github.com/sergiodxa/remix-auth#custom-redirect-url-based-on-the-user
  const _session = await getSession(request.headers.get('cookie'));
  _session.set(authenticator.sessionKey, session);
  const headers = new Headers({ 'Set-Cookie': await commitSession(_session) });

  return redirect(returnTo === '/' ? '/' + session.user.id : returnTo, { headers });
};

export const ErrorBoundary = ({ error }: { error: Error }) => {
  console.log('spotify.callback error ->', error);
  return (
    <Text fontSize="14px" color="white">
      Only authorized users while in development {`:(`}
    </Text>
  );
};

export const CatchBoundary = () => {
  let caught = useCatch();
  console.log('spotify.callback caught ->', caught);
  let message;
  switch (caught.status) {
    case 401:
      message = <Text>Only authorized users while in development</Text>;
      break;
    case 404:
      message = <Text>Oops, you shouldn&apos;t be here (Page doesn&apos;t exist)</Text>;
      break;
    case 429:
      message = <Text>Oops, API suspended (too many requests)</Text>;
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <>
      <Heading fontSize={['sm', 'md']}>
        {caught.status} - {caught.statusText}
      </Heading>
      <Text fontSize="sm">{message}</Text>
    </>
  );
};
