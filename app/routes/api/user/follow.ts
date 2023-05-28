import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { prisma } from '~/services/db.server';
import { getCurrentUserId } from '~/services/prisma/users.server';
import { getSpotifyClient } from '~/services/spotify.server';

export const action = async ({ request }: ActionArgs) => {
  const currentUserId = await getCurrentUserId(request);
  const body = await request.formData();
  const userId = body.get('userId');
  const isFollowing = body.get('isFollowing');

  if (typeof userId !== 'string' || typeof isFollowing !== 'string') {
    return typedjson('Bad Request');
  }
  const { spotify } = await getSpotifyClient(currentUserId);
  invariant(spotify, 'Spotify API Error');

  if (isFollowing === 'true') {
    await spotify.unfollowUsers([userId]);
    await prisma.follow.delete({
      where: { followingId_followerId: { followerId: currentUserId, followingId: userId } },
    });
  } else if (isFollowing === 'false') {
    await spotify.followUsers([userId]);
    await prisma.follow.create({
      data: {
        follower: {
          connect: { userId: currentUserId },
        },
        following: {
          connect: { userId },
        },
      },
    });
  }
  return null;
};

export const loader = () => {
  throw json({}, { status: 404 });
};
