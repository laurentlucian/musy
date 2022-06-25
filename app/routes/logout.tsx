import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';

import { destroySession, getSession } from '~/services/session.server';

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const redirectTo = (body.get('redirectTo') as string) ?? '/';

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await destroySession(await getSession(request.headers.get('cookie'))),
    },
  });
};

export const loader: LoaderFunction = () => {
  throw json({}, { status: 404 });
};
