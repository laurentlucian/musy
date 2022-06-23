import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { spotifyStrategy } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { ownerQ } from '~/services/scheduler/jobs/party';
import { spotifyApi } from '~/services/spotify.server';

export const loader: LoaderFunction = () => {
  throw json({}, { status: 404 });
};

export const action: ActionFunction = async ({ request, params }) => {
  // - create party relationship
  // - play owner's currentTrack
  console.log('Joining party...');
  const ownerId = params.ownerId;
  if (!ownerId) throw redirect('/');

  const session = await spotifyStrategy.getSession(request);

  if (!session || !session.user || !session.user.name || !session.user.image) {
    console.log('Party join failed -> no authentication');
    return redirect('/' + ownerId);
  }
  const userId = session.user.id;

  const party = await prisma.party.findUnique({ where: { userId } });
  if (party) {
    if (party.ownerId !== ownerId) {
      console.log('Party join -> leaving existing party');
      await prisma.party.delete({ where: { userId } });
    }

    // party with both users already exists, refresh page?
    return redirect('/' + ownerId);
  }

  const { spotify: owner_spotify } = await spotifyApi(ownerId);
  if (!owner_spotify) {
    console.log('Party join failed -> no spotify API');
    return redirect('/' + ownerId);
  }

  const { body: playback } = await owner_spotify.getMyCurrentPlaybackState();
  const currentTrack = playback.item?.uri;
  if (!currentTrack) {
    console.log('Party join failed -> no currentTrack found');
    return redirect('/' + ownerId);
  }
  await prisma.user.update({
    where: { id: ownerId },
    data: {
      party: {
        create: {
          userId,
          userName: session.user.name,
          userImage: session.user.image,
          currentTrack,
        },
      },
    },
  });

  const { spotify: listener_spotify } = await spotifyApi(userId);
  await listener_spotify?.play({ uris: [currentTrack] });
  console.log('Party join -> played song');

  if (playback?.progress_ms && playback.item?.duration_ms) {
    await ownerQ.add(
      'update_track',
      {
        ownerId,
        userId,
      },
      {
        repeat: {
          every: 30000,
        },
      },
    );
  }
  console.log('Party join -> add ownerQ update_track');

  return redirect('/' + ownerId);
};
