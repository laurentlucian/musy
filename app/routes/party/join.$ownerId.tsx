import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { spotifyStrategy } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

export const loader: LoaderFunction = () => {
  throw json({}, { status: 404 });
};

// @todo script for party relationship to keep listening syncronized
// - get all existing parties
// - delete related parties if owner has stopped
// - delete unique party if listener has paused
// - get currentTrack of existing owners' party
// - adds currentTrack to queue of listeners

export const action: ActionFunction = async ({ request, params }) => {
  // - create party relationship
  // - play owner's currentTrack
  const ownerId = params.ownerId;
  if (!ownerId) throw redirect('/');

  const session = await spotifyStrategy.getSession(request);
  console.log('session', session);

  if (!session || !session.user || !session.user.name || !session.user.image)
    // @todo redirect to authentication
    return redirect('/' + ownerId);
  const userId = session.user.id;

  const party = await prisma.party.findUnique({ where: { userId } });
  if (party) {
    // if session.user is in a party then destroy it first
    if (party.ownerId !== ownerId) {
      await prisma.party.delete({ where: { userId } });
    }

    // shouldn't be here if party with both users already exists
    return redirect('/' + ownerId);
  }

  await prisma.user.update({
    where: { id: ownerId },
    data: {
      party: { create: { userId, userName: session.user.name, userImage: session.user.image } },
    },
  });

  const { spotify: owner_spotify } = await spotifyApi(ownerId);
  // possible to not get owner's spotify (?) revoked access?
  if (!owner_spotify) return redirect('/' + ownerId);

  const { body: playback } = await owner_spotify.getMyCurrentPlaybackState();
  const currentTrack = playback.item?.uri;
  //  owner isn't playing (?)
  if (!currentTrack) return redirect('/' + ownerId);

  const { spotify: user_spotify } = await spotifyApi(userId);
  await user_spotify?.play({ uris: [currentTrack] });

  return redirect('/' + ownerId);
};
