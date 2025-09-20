import { prisma } from "~/lib/services/db.server";
import { generateId } from "~/lib/utils.server";

export async function migrateUserIds() {
  console.log("starting user id migration...");

  const users = await prisma.user.findMany();
  console.log(`found ${users.length} users to migrate`);

  for (const user of users) {
    const newId = generateId();

    if (user.id === newId) {
      console.log(`user ${user.id} already has correct format`);
      continue;
    }

    console.log(`generating new id for user ${user.id}: ${newId}`);

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { newId },
      });

      console.log(`successfully generated new id for user ${user.id}`);
    } catch (error) {
      console.error(`failed to generate new id for user ${user.id}:`, error);
    }
  }

  console.log("migration completed");
}
