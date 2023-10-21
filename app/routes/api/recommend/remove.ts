import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { typedjson } from 'remix-typedjson';

import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const body = await request.formData();
  const trackId = body.get('trackId');

  if (!session || !session.user) return typedjson('Unauthorized', { status: 401 });

  if (typeof trackId !== 'string') return typedjson('Incorrect form data', { status: 401 });

  try {
    const recommended = await prisma.recommended.findFirst({
      where: {
        AND: [{ trackId }, { userId: session.user.id }],
      },
    });
    if (recommended) {
      await prisma.recommended.delete({
        where: {
          id: recommended.id,
        },
      });
    }
  } catch (error) {
    console.log('remove recommend -> error', error);
    return typedjson('Error');
  }

  return typedjson('Removed');
};

export const loader = () => {
  throw json({}, { status: 404 });
};

export default () => null;
