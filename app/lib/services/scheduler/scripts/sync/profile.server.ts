import { eq } from "drizzle-orm";
import type Spotified from "spotified";
import { profile, sync } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { log } from "~/lib/utils";

export async function syncUserProfile({
  userId,
  spotify,
}: {
  userId: string;
  spotify: Spotified;
}) {
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
