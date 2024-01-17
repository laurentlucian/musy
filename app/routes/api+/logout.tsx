import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { authenticator } from '~/services/auth.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  return authenticator.logout(request, {
    redirectTo: '/',
  });
};

export const loader = () => {
  throw json({}, { status: 404 });
};

export default () => null;
