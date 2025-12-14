import type Spotified from "spotified";
import { follow, sync } from "~/lib/db/schema";
import { getAllUsersId } from "~/lib/services/db/users.server";
import { db } from "~/lib/services/db.server";
import { log } from "~/lib/utils";

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
      await db
        .insert(follow)
        .values({
          followerId: userId,
          followingId,
        })
        .onConflictDoNothing();
    }
    const now = new Date().toISOString();
    await db
      .insert(sync)
      .values({
        userId,
        state: "success",
        type: "follow",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [sync.userId, sync.state, sync.type],
        set: { state: "success", updatedAt: now },
      });
    log("completed", "follow");
  } catch {
    const now = new Date().toISOString();
    await db
      .insert(sync)
      .values({
        userId,
        state: "failure",
        type: "follow",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [sync.userId, sync.state, sync.type],
        set: { state: "failure", updatedAt: now },
      });
    log("failure", "follow");
  }
}
