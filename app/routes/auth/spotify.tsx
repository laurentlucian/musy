import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { authenticator } from '~/services/auth.server';

export const loader: LoaderFunction = () => redirect('/login');

export const action: ActionFunction = async ({ request }) => {
  return await authenticator.authenticate('spotify', request);
};
