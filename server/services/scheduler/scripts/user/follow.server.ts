import debug from "debug";
import { prisma } from "server/services/db.server";
import { getSpotifyClient } from "server/services/spotify.server";

const log = debug("musy:follow");

export async function syncUserFollow(userId: string) {
  log("starting...");

  const { spotify } = await getSpotifyClient(userId);

  if (!spotify) {
    log("no spotify client");
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

  log("adding following to db", following.length);

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

  log("completed");
}
