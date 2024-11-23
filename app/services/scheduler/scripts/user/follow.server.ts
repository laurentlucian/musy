import debug from 'debug';
import { prisma } from '~/services/db.server';
import { getSpotifyClient } from '~/services/spotify.server';

const debugFollowQ = debug('userQ:followQ');

export async function syncUserFollow(userId: string) {
  debugFollowQ('starting...');

  const { spotify } = await getSpotifyClient(userId);

  if (!spotify) {
    debugFollowQ('no spotify client');
    return;
  }

  const users = await prisma.user
    .findMany({
      select: { id: true },
      where: { revoked: false },
    })
    .then((users) => users.map((u) => u.id));

  const { body: isFollowing } = await spotify.isFollowingUsers(users);
  const following = users.filter((_, i) => isFollowing[i]);

  debugFollowQ('adding following to db', following.length);

  for (const followingId of following) {
    await prisma.follow.upsert({
      create: {
        followerId: userId,
        followingId,
      },
      update: {},
      where: {
        followingId_followerId: {
          followerId: userId,
          followingId,
        },
      },
    });
  }

  debugFollowQ('completed');
}
