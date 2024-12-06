import { prisma } from "@lib/services/db.server";
import { getAllUsersId } from "@lib/services/db/users.server";
import { SpotifyService } from "@lib/services/sdk/spotify.server";
import { log } from "@lib/utils";
import invariant from "tiny-invariant";

export async function syncUserFollow(userId: string) {
  log("starting...", "follow");

  const spotify = await SpotifyService.createFromUserId(userId);
  const client = spotify.getClient();
  invariant(client, "spotify client not found");

  const users = await getAllUsersId();

  const { body: isFollowing } = await client.isFollowingUsers(users);
  const following = users.filter((_, i) => isFollowing[i]);

  log(`adding following to db: ${following.length}`, "follow");

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

  log("completed", "follow");
}
