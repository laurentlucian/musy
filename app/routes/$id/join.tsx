import { Heading, Text } from '@chakra-ui/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useCatch } from '@remix-run/react';
import { spotifyStrategy } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { ownerQ } from '~/services/scheduler/jobs/party';
import { spotifyApi } from '~/services/spotify.server';

export const loader: LoaderFunction = ({ params }) => {
  return redirect('/' + params.id);
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
    return redirect('/auth/spotify?returnTo=/' + ownerId);
  }
  const userId = session.user.id;

  const party = await prisma.party.findUnique({ where: { userId } });
  if (party) {
    if (party.ownerId === ownerId) {
      // party with both users already exists, refresh page?
      return redirect('/' + ownerId);
    }
    console.log('Party join -> leaving existing party');
    await prisma.party.delete({ where: { userId } });
  }

  const { spotify: owner_spotify } = await spotifyApi(ownerId);
  if (!owner_spotify) {
    console.log('Party join failed -> no spotify API');
    return redirect('/' + ownerId);
  }

  const { body: playback } = await owner_spotify.getMyCurrentPlaybackState();
  if (!playback.item) {
    console.log('Party join failed -> no currentTrack found');
    return redirect('/' + ownerId);
  }

  try {
    const { spotify: listener_spotify } = await spotifyApi(userId);
    if (!listener_spotify) {
      console.log('Party join failed -> no spotify API');
      return redirect('/' + ownerId);
    }

    const { body } = await listener_spotify.getMyCurrentPlaybackState();

    const currentTrack = playback.item.uri;
    // purposely putting listener 11 seconds behind to allow scheduler time to add the next song to queue
    const progressMs = playback.progress_ms ? playback.progress_ms - 11000 : 0;
    // const progressMs = playback.progress_ms ?? 0;

    const play = async () => {
      try {
        await listener_spotify.play({
          uris: [currentTrack],
          position_ms: progressMs,
        });
        console.log('Party join -> played song at same time');
      } catch {
        console.log('Party join failed -> error when attempting to play');
        return json('Error: Premium required');
      }
    };
    if (body.is_playing) {
      // 2 types of queue:
      // context queue when a playlist/album is playing and next queue which is when the user manually queue tracks;
      // doing the following prevent play api from clearing the context queue once joining party
      // in case party ends, user will continue listening to their context queue
      console.log('Party join -> user is playing');
      try {
        await listener_spotify.addToQueue(currentTrack);

        console.log('Party join -> queued track');
        await listener_spotify.skipToNext();
        console.log('Party join -> skipped to next');
        const { body } = await listener_spotify.getMyCurrentPlaybackState();
        if (body.item?.uri !== currentTrack) {
          console.log('Party join -> track not the same; played currentTrack instead');
          // edge case: if user has tracks in the next queue it'll add to the end of the list
          // if so then play the currentTrack and clear context queue anyway
          play();
        } else {
          await listener_spotify.seek(progressMs);
        }
        console.log(
          'Party join -> user is playing, queued, skipped to next and seeked to progress_ms',
        );
      } catch {
        console.log('Party join failed -> error when attempting to queue');
        return json('Error: Premium required');
      }
    } else {
      play();
    }

    await ownerQ.add(
      'update_track',
      {
        ownerId,
        userId,
      },
      {
        repeat: {
          every: 10000,
        },
        jobId: ownerId,
      },
    );

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
    console.log('Party join -> added ownerQ update_track and created party in db');
    return redirect('/' + ownerId);
  } catch (e) {
    console.log('Party join failed ->', e);
    return null;
  }
};

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
