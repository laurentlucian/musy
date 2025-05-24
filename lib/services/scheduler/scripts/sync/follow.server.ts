import { getAllUsersId } from "@lib/services/db/users.server";
import { prisma } from "@lib/services/db.server";
import type Spotified from "@lib/services/sdk/spotified/client/Spotified";
import { log } from "@lib/utils";

export async function syncUserFollow({
  userId,
  spotify,
}: {
  userId: string;
  spotify: Spotified;
}) {
  try {
    const users = await getAllUsersId();
    const isFollowing = await spotify.user.checkIfUserFollowsArtistsOrUsers(
      "user",
      users,
    );

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
    await prisma.sync.upsert({
      create: {
        userId,
        state: "success",
        type: "follow",
      },
      update: {
        state: "success",
      },
      where: {
        userId_type_state: { userId, type: "follow", state: "success" },
      },
    });
    log("completed", "follow");
  } catch {
    await prisma.sync.upsert({
      create: {
        userId,
        state: "failure",
        type: "follow",
      },
      update: {
        state: "failure",
      },
      where: {
        userId_type_state: { userId, type: "follow", state: "failure" },
      },
    });
    log("failure", "follow");
  }
}
