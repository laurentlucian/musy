import type { ActionFunctionArgs } from '@remix-run/server-runtime';
import { redirect } from 'react-router';

import { authenticator } from '~/services/auth.server';

export async function action({ request }: ActionFunctionArgs) {
  return authenticator.authenticate('spotify', request, {
    failureRedirect: '/',
    successRedirect: '/home',
  });
}

export const loader = () => redirect('/');
export default () => null;
