import { eq } from "drizzle-orm";
import { user } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { generateId } from "~/lib/utils.server";

export async function migrateUserIds() {
  console.log("starting user id migration...");

  const users = await db.select().from(user);
  console.log(`found ${users.length} users to migrate`);

  for (const userData of users) {
    const newId = generateId();

    if (userData.id === newId) {
      console.log(`user ${userData.id} already has correct format`);
      continue;
    }

    console.log(`generating new id for user ${userData.id}: ${newId}`);

    try {
      await db.update(user).set({ newId }).where(eq(user.id, userData.id));

      console.log(`successfully generated new id for user ${userData.id}`);
    } catch (error) {
      console.error(
        `failed to generate new id for user ${userData.id}:`,
        error,
      );
    }
  }

  console.log("migration completed");
}
