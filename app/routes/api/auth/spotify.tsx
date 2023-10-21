import type { ActionFunctionArgs } from '@remix-run/server-runtime';
import { redirect } from 'react-router';

import { authenticator } from '~/services/auth.server';
import { returnToCookie } from '~/services/session.server';

const isRedirect = (response: Response) => {
  if (response.status < 300 || response.status >= 400) return false;
  return response.headers.has('Location');
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get('returnTo') as string | null;

  try {
    return await authenticator.authenticate('spotify', request);
  } catch (error) {
    // catches an error if it needs oauth2 authentication
    if (!returnTo) throw error;
    if (error instanceof Response && isRedirect(error)) {
      // If it's a Response and is a redirect, append a Set-Cookie header with the returnToCookie serialized and throw the response
      error.headers.append('Set-Cookie', await returnToCookie.serialize(returnTo));
      return error;
    }
    throw error;
  }
};

export const loader = () => redirect('/');
export default () => null;
