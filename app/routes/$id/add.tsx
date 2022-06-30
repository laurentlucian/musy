import type { Queue } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { prisma } from '~/services/db.server';
import { activityQ } from '~/services/scheduler/jobs/activity';
import { spotifyApi } from '~/services/spotify.server';

export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params;
  if (!id) throw redirect('/');
  const body = await request.formData();
  const uri = body.get('uri');
  const image = body.get('image');
  const name = body.get('name');
  const artist = body.get('artist');
  const explicit = Boolean(body.get('explicit'));
  const fromUserId = body.get('fromId');

  if (
    typeof uri !== 'string' ||
    typeof image !== 'string' ||
    typeof name !== 'string' ||
    typeof artist !== 'string' ||
    typeof explicit !== 'boolean' ||
    typeof fromUserId !== 'string'
  ) {
    return json('Request Error');
  }

  const fields = {
    uri,
    name,
    image,
    artist,
    explicit,
    ownerId: id,
    userId: fromUserId,
  };

  const { spotify } = await spotifyApi(id);
  if (!spotify) return json('API Error');

  try {
    await spotify.addToQueue(uri);
    if (id !== fromUserId) {
      // only if currentUser is adding from someone's else page
      await prisma.queue.create({ data: fields });
    }
    return json('Queued');
  } catch (error) {
    // @ts-ignore
    console.log('add -> error', error?.reason);
    if (id !== fromUserId) {
      const activity = await prisma.queue.create({ data: { ...fields, pending: true } });
      const res = await activityQ.add(
        'pending_activity',
        {
          activityId: activity.id,
        },
        {
          repeat: {
            every: 30000,
          },
        },
      );
      console.log('add -> created Job on ', res.queueName);
    }

    // tell user when queue didn't work (can't queue when user isn't playing)
    return json('Will queue once play resume');
  }
};

export const loader: LoaderFunction = () => {
  throw json({}, { status: 404 });
};
