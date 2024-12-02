import debug from "debug";
import invariant from "tiny-invariant";
import { prisma } from "~/services/db.server";
import { getAllUsersId } from "~/services/prisma/users.server";
import { SpotifyService } from "~/services/sdk/spotify.server";

const log = debug("musy:follow");

export async function syncUserFollow(userId: string) {
  log("starting...");

  const spotify = await SpotifyService.createFromUserId(userId);
  const client = spotify.getClient();
  invariant(client, "spotify client not found");

  const users = await getAllUsersId();

  const { body: isFollowing } = await client.isFollowingUsers(users);
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
