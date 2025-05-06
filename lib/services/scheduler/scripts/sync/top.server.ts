import { prisma } from "@lib/services/db.server";
import {
  transformArtists,
  transformTracks,
} from "@lib/services/sdk/helpers/spotify.server";
import type Spotified from "@lib/services/sdk/spotified";
import { log } from "@lib/utils";
import { generateId } from "@lib/utils.server";

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
      await syncTopSongs({ userId, spotify, range });
      await syncTopArtists({ userId, spotify, range });
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
  } catch (error) {
    log("failure:" + error, "top");
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
  }
}

async function syncTopSongs({
  userId,
  spotify,
  range,
}: {
  userId: string;
  spotify: Spotified;
  range: (typeof ranges)[number];
}) {
  const response = await spotify.user.getUserTopItems("tracks", {
    limit: 50,
    time_range: range,
  });

  const trackIds = await transformTracks(response.items);

  const existing = await prisma.topSongs.findFirst({
    where: {
      userId,
      type: "tracks",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const newList = trackIds.join(",");
  if (existing) {
    const existingList = existing.trackIds;
    if (existingList === newList) {
      log("skipped", `top_${range}`);
      return;
    }

    await prisma.topSongs.create({
      data: {
        id: generateId(),
        type: range,
        trackIds: newList,
        tracks: {
          connect: trackIds.map((id) => ({ id })),
        },
        top: {
          connectOrCreate: {
            create: {
              userId,
            },
            where: {
              userId,
            },
          },
        },
      },
    });
  } else {
    await prisma.topSongs.create({
      data: {
        id: generateId(),
        type: range,
        trackIds: newList,
        tracks: {
          connect: trackIds.map((id) => ({ id })),
        },
        top: {
          connectOrCreate: {
            create: {
              userId,
            },
            where: {
              userId,
            },
          },
        },
      },
    });
  }
}

async function syncTopArtists({
  userId,
  spotify,
  range,
}: {
  userId: string;
  spotify: Spotified;
  range: (typeof ranges)[number];
}) {
  const response = await spotify.user.getUserTopItems("artists", {
    limit: 50,
    time_range: range,
  });

  const artistIds = await transformArtists(response.items);

  const existing = await prisma.topArtists.findFirst({
    where: {
      userId,
      type: range,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const newList = artistIds.join(",");
  if (existing?.artistIds === newList) {
    log("skipped", `top_${range}`);
    return;
  }

  await prisma.topArtists.create({
    data: {
      id: generateId(),
      type: range,
      artistIds: newList,
      artists: {
        connect: artistIds.map((id) => ({ id })),
      },
      top: {
        connectOrCreate: {
          create: {
            userId,
          },
          where: {
            userId,
          },
        },
      },
    },
  });
}
