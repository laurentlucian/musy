import { Heading, Text } from '@chakra-ui/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useCatch } from '@remix-run/react';
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
  const ownerId = params.id;
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

  try {
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
    console.log('Party join -> add ownerQ update_track');
    return redirect('/' + ownerId);
  } catch {
    console.log('Party join failed -> @todo handle error');
    return null;
  }
};

const Join = () => {
  return <></>;
};
export default Join;

export const ErrorBoundary = ({ error }: any) => {
  console.log('error', error);
  return (
    <Text fontSize="14px" color="white">
      Only authorized users while in development {`:(`}
    </Text>
  );
};

export const CatchBoundary = () => {
  let caught = useCatch();
  let message;
  switch (caught.status) {
    case 401:
      message = <Text>Oops, you shouldn't be here (No access)</Text>;
      break;
    case 404:
      message = <Text>Oops, you shouldn't be here (Page doesn't exist)</Text>;
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <>
      <Heading fontSize={['xl', 'xxl']}>
        {caught.status}: {caught.statusText}
      </Heading>
      <Text fontSize="md">{message}</Text>
    </>
  );
};
