import { prisma } from '~/services/db.server';
import { getSpotifyClient } from '~/services/spotify.server';

import { Queue } from '../../queue.server';
import { debugFollowQ } from '../user.server';

export const followQ = Queue<{ userId: string }>('update_follow', async (job) => {
  const { userId } = job.data;
  debugFollowQ('starting...');

  const { spotify } = await getSpotifyClient(userId);

  if (!spotify) {
    debugFollowQ('no spotify client');
    return;
  }

  const users = await prisma.user
    .findMany({
      select: {
        id: true,
      },
      where: {
        revoked: false,
      },
    })
    .then((users) => users.map((u) => u.id));

  const { body: isFollowing } = await spotify.isFollowingUsers(users);

  const following = users.filter((_, i) => isFollowing[i]);

  debugFollowQ('adding following to db', following.length);
  for (const followingId of following) {
    await prisma.follow.upsert({
      create: {
        // create if it doesn't exist -- if user unfollow in musy but keep in spotify, it'll auto follow again on next job run
        followerId: userId,
        followingId,
      },
      update: {}, // if it exists, do nothing
      where: {
        followingId_followerId: {
          followerId: userId,
          followingId,
        },
      },
    });
  }

  debugFollowQ('completed');
});
