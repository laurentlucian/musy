import type { ActionArgs } from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime';

import { cors } from 'remix-utils';

import { getAllUsers } from '~/services/prisma/users.server';

export async function action({ request }: ActionArgs) {
  let data = await getAllUsers();
  return await cors(request, json(data));
}

export const loader = () => {
  throw json({}, { status: 404 });
};
