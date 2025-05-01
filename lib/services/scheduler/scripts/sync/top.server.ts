import { prisma } from "@lib/services/db.server";
import { transformTracks } from "@lib/services/sdk/helpers/spotify.server";
import { log } from "@lib/utils";
import { generateId } from "@lib/utils.server";
import type Spotified from "spotified";

const ranges = ["short_term", "medium_term", "long_term"] as const;
export async function syncUserTop({
  userId,
  spotify,
}: {
  userId: string;
  spotify: Spotified;
}) {
  try {
    for (const range of ranges) {
      log("syncing", `top_${range}`);
      const response = await spotify.user.getUserTopItems("tracks", {
        limit: 50,
        time_range: range,
      });

      const tracks = await transformTracks(response.items);

      const existing = await prisma.topSongs.findFirst({
        where: {
          userId,
          type: "tracks",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const newList = tracks.map((track) => track.id).join(",");
      if (existing) {
        const existingList = existing.trackIds;

        if (existingList === newList) {
          log("skipped", `top_${range}`);
          continue;
        }

        await prisma.topSongs.create({
          data: {
            id: generateId(),
            type: range,
            trackIds: newList,
            tracks: {
              connect: tracks.map((track) => ({ id: track.id })),
            },
            userId,
          },
        });
      } else {
        await prisma.topSongs.create({
          data: {
            id: generateId(),
            type: range,
            trackIds: newList,
            tracks: {
              connect: tracks.map((track) => ({ id: track.id })),
            },
            userId,
          },
        });
      }
    }

    log("completed", "top");
    await prisma.sync.upsert({
      create: {
        userId,
        state: "success",
        type: "top",
      },
      update: {
        state: "success",
      },
      where: {
        userId_type_state: { userId, type: "top", state: "success" },
      },
    });
  } catch {
    await prisma.sync.upsert({
      create: {
        userId,
        state: "failure",
        type: "top",
      },
      update: {
        state: "failure",
      },
      where: {
        userId_type_state: { userId, type: "top", state: "failure" },
      },
    });
    log("failure", "top");
  }
}
