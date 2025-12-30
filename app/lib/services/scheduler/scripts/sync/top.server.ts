import { desc, eq } from "drizzle-orm";
import type Spotified from "spotified";
import {
  artistToTopArtists,
  sync,
  top,
  topArtists,
  topSongs,
  topSongsToTrack,
} from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import {
  transformArtists,
  transformTracks,
} from "~/lib/services/sdk/helpers/spotify.server";
import { log } from "~/lib/utils";
import { generateId } from "~/lib/utils.server";

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
    const now = new Date().toISOString();
    await db
      .insert(sync)
      .values({
        userId,
        state: "success",
        type: "top",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [sync.userId, sync.state, sync.type],
        set: { state: "success", updatedAt: now },
      });
  } catch (error) {
    log(`failure:${error}`, "top");
    const now = new Date().toISOString();
    await db
      .insert(sync)
      .values({
        userId,
        state: "failure",
        type: "top",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [sync.userId, sync.state, sync.type],
        set: { state: "failure", updatedAt: now },
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

  const existing = await db.query.topSongs.findFirst({
    where: eq(topSongs.userId, userId),
    orderBy: desc(topSongs.createdAt),
  });

  const newList = trackIds.join(",");
  if (existing?.trackIds === newList) {
    log("skipped", `top_${range}`);
    return;
  }

  const now = new Date().toISOString();
  const topSongsId = generateId();

  // First ensure the top record exists
  await db.insert(top).values({ userId }).onConflictDoNothing();

  // Create the top songs record
  await db.insert(topSongs).values({
    id: topSongsId,
    userId,
    type: range,
    trackIds: newList,
    createdAt: now,
  });

  // Create many-to-many relationships (2 columns = max 45 per batch for safety)
  if (trackIds.length > 0) {
    const relations = trackIds.map((trackId) => ({
      a: topSongsId,
      b: trackId,
    }));
    const batchSize = 45;
    for (let i = 0; i < relations.length; i += batchSize) {
      const batch = relations.slice(i, i + batchSize);
      await db.insert(topSongsToTrack).values(batch);
    }
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

  const existing = await db.query.topArtists.findFirst({
    where: eq(topArtists.userId, userId),
    orderBy: desc(topArtists.createdAt),
  });

  const newList = artistIds.join(",");
  if (existing?.artistIds === newList) {
    log("skipped", `top_${range}`);
    return;
  }

  const now = new Date().toISOString();
  const topArtistsId = generateId();

  // First ensure the top record exists
  await db.insert(top).values({ userId }).onConflictDoNothing();

  // Create the top artists record
  await db.insert(topArtists).values({
    id: topArtistsId,
    userId,
    type: range,
    artistIds: newList,
    createdAt: now,
  });

  // Create many-to-many relationships (2 columns = max 45 per batch for safety)
  if (artistIds.length > 0) {
    const relations = artistIds.map((artistId) => ({
      a: artistId,
      b: topArtistsId,
    }));
    const batchSize = 45;
    for (let i = 0; i < relations.length; i += batchSize) {
      const batch = relations.slice(i, i + batchSize);
      await db.insert(artistToTopArtists).values(batch);
    }
  }
}
