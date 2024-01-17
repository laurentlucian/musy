import { type LoaderFunctionArgs } from '@remix-run/node';

import { authenticator } from '~/services/auth.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return authenticator.authenticate('spotify', request, {
    failureRedirect: '/',
    successRedirect: '/home',
  });
};
