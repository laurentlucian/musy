import type { ActionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';

import { spotifyStrategy } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();
  const ownerId = body.get('userId');
  console.log('Leaving party...');
  if (typeof ownerId !== 'string') {
    console.log('Leave failed -> missing ownerId parameter');
    throw redirect('/');
  }
  const session = await spotifyStrategy.getSession(request);

  if (!session || !session.user) {
    console.log('Leave failed -> no authentication');
    return redirect('/' + ownerId);
  }

  const userId = session.user.id;
  const party = await prisma.party.findUnique({ where: { userId } });

  // shouldn't be here if not in party
  if (!party) {
    console.log('Leave failed -> not in a party');
    return redirect('/' + ownerId);
  }
  await prisma.party.delete({ where: { userId } });

  console.log('Left party');
  return redirect('/' + ownerId);
};

export const loader = () => {
  throw json({}, { status: 404 });
};

export default () => null;
