import type { LoaderFunction } from '@remix-run/node';
import { spotifyStrategy } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { json, redirect } from '@remix-run/node';

export const action: LoaderFunction = async ({ request, params }) => {
  const ownerId = params.ownerId;
  console.log('Leaving party...');
  if (!ownerId) {
    console.log('Leave failed -> missing ownerId parameter');
    throw redirect('/');
  }
  const session = await spotifyStrategy.getSession(request);

  if (!session || !session.user) {
    console.log('Leave failed -> no authentication');
    return redirect(request.url);
  }

  const userId = session.user.id;
  const party = await prisma.party.findUnique({ where: { userId } });

  // shouldn't be here if not in party
  if (!party) {
    console.log('Leave failed -> not in a party');
    return redirect(request.url);
  }
  await prisma.party.delete({ where: { userId } });

  console.log('Left party');
  return redirect(request.url);
};

export const loader: LoaderFunction = () => {
  throw json({}, { status: 404 });
};
