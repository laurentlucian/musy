import type { ActionFunction, LoaderFunction } from '@remix-run/node';

import { authenticator } from '~/services/auth.server';
import { returnToCookie } from '~/services/session.server';

export const loader: LoaderFunction = ({ request }) => authenticate(request);

export const action: ActionFunction = ({ request }) => authenticate(request);

const authenticate = async (request: Request) => {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get('returnTo');

  const headers = new Headers();
  if (returnTo) {
    headers.append('Set-Cookie', await returnToCookie.serialize(returnTo));
  }

  return await authenticator.authenticate('spotify', request);
};
