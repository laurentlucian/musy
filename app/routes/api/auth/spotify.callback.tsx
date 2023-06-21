import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { authenticator } from '~/services/auth.server';
import { commitSession, getSession, returnToCookie } from '~/services/session.server';

export const loader = async ({ request }: LoaderArgs) => {
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

export default () => null;
