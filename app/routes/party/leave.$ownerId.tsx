import type { LoaderFunction } from '@remix-run/node';
import { spotifyStrategy } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { json, redirect } from '@remix-run/node';
import { spotifyApi } from '~/services/spotify.server';

export const action: LoaderFunction = async ({ request, params }) => {
  const ownerId = params.ownerId;
  // const deviceId = params.deviceId;
  if (!ownerId) throw redirect('/');
  // getSession() is supposed to refreshToken when expired but isn't
  // it's okay for now because we only need it once from authentication
  const session = await spotifyStrategy.getSession(request);
  // shouldn't be here if not authenticated
  if (!session || !session.user) return redirect('/' + ownerId);

  const userId = session.user.id;
  const party = await prisma.party.findUnique({ where: { userId } });

  // shouldn't be here if not in party
  if (!party) return redirect('/' + ownerId);
  await prisma.party.delete({ where: { userId } });

  // let it play even if leaves party
  // const { spotify: user_spotify } = await spotifyApi(userId);
  // await user_spotify?.pause();

  // what to return when successful
  return redirect('/' + ownerId);
};

export const loader: LoaderFunction = () => {
  throw json({}, { status: 404 });
};
