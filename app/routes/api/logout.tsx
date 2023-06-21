import type { ActionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';

import { destroySession, getSession } from '~/services/session.server';

export const action = async ({ request }: ActionArgs) => {
  return redirect('/', {
    headers: {
      'Set-Cookie': await destroySession(await getSession(request.headers.get('cookie'))),
    },
  });
};

export const loader = () => {
  throw json({}, { status: 404 });
};

export default () => null;
