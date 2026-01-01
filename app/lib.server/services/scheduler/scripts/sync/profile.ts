import { and, desc, eq, gte } from "drizzle-orm";
import { log } from "~/components/utils";
import { profile, sync } from "~/lib.server/db/schema";
import { db } from "~/lib.server/services/db";
import type { Spotified } from "~/lib.server/services/sdk/spotify";

const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export async function syncUserProfile({
  userId,
  spotify,
}: {
  userId: string;
  spotify: Spotified;
}) {
  const recentSync = await db.query.sync.findFirst({
    where: and(
      eq(sync.userId, userId),
      eq(sync.type, "profile"),
      eq(sync.state, "success"),
    ),
    orderBy: desc(sync.updatedAt),
  });

  if (recentSync) {
    const updatedAt = new Date(recentSync.updatedAt).getTime();
    const now = Date.now();
    if (now - updatedAt < SYNC_COOLDOWN_MS) {
      log("skipped - recent sync exists", "profile");
      return;
    }
  }

  try {
    const response = await spotify.user.getCurrentUserProfile();

    const images = response.images;
    const image = images?.[0]?.url || images?.[1]?.url;
    const name = response.display_name;

    await db
      .update(profile)
      .set({
        image,
        name,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(profile.id, userId));

    log("completed", "profile");
    const now = new Date().toISOString();
    await db
      .insert(sync)
      .values({
        userId,
        state: "success",
        type: "profile",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [sync.userId, sync.state, sync.type],
        set: { state: "success", updatedAt: now },
      });
  } catch (error) {
    log("failure", "profile");
    const now = new Date().toISOString();
    await db
      .insert(sync)
      .values({
        userId,
        state: "failure",
        type: "profile",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [sync.userId, sync.state, sync.type],
        set: { state: "failure", updatedAt: now },
      });
    throw error;
  }
}
