import { prisma } from "@lib/services/db.server";
import type Spotified from "@lib/services/sdk/spotified";
import { log } from "@lib/utils";

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

    await prisma.profile.update({
      where: { id: userId },
      data: {
        image,
        name,
      },
    });

    log("completed", "profile");
    await prisma.sync.upsert({
      create: {
        userId,
        state: "success",
        type: "profile",
      },
      update: {
        state: "success",
      },
      where: {
        userId_type_state: { userId, type: "profile", state: "success" },
      },
    });
  } catch (error) {
    log("failure", "profile");
    await prisma.sync.upsert({
      create: {
        userId,
        state: "failure",
        type: "profile",
      },
      update: {
        state: "failure",
      },
      where: {
        userId_type_state: { userId, type: "profile", state: "failure" },
      },
    });
    throw error;
  }
}
